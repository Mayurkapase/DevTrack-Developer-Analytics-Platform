package com.devtrack.service;

import com.devtrack.dto.*;
import com.devtrack.entity.GithubStats;
import com.devtrack.entity.Role;
import com.devtrack.entity.User;
import com.devtrack.exception.ApiException;
import com.devtrack.exception.BadRequestException;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.GithubStatsRepository;
import com.devtrack.repository.UserRepository;
import com.devtrack.security.JwtUtils;
import com.devtrack.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final GithubStatsRepository githubStatsRepository;
    private final GithubService githubService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = jwtUtils.generateToken(principal);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        String jwt = jwtUtils.generateToken(userPrincipal);

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void logout(Long userId) {
        // Stateless JWT token - client clears local token on logout
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new ApiException("User not authenticated", HttpStatus.UNAUTHORIZED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentAuthenticatedUser();
        String githubUsername = githubStatsRepository.findByUserId(user.getId())
                .map(GithubStats::getGithubUsername)
                .orElse(null);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .githubUsername(githubUsername)
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateUserProfile(User user, UpdateProfileRequest request) {
        user.setName(request.getName().trim());
        User saved = userRepository.save(user);

        String newGh = request.getGithubUsername();
        if (newGh != null && !newGh.trim().isEmpty()) {
            String cleanGh = newGh.trim();
            try {
                githubService.fetchAndSaveGithubStats(saved, cleanGh);
            } catch (Exception e) {
                GithubStats stats = githubStatsRepository.findByUserId(saved.getId())
                        .orElseGet(() -> GithubStats.builder().user(saved).build());
                stats.setGithubUsername(cleanGh);
                stats.setLastUpdated(java.time.LocalDateTime.now());
                githubStatsRepository.save(stats);
            }
        }

        String githubUsername = githubStatsRepository.findByUserId(saved.getId())
                .map(GithubStats::getGithubUsername)
                .orElse(null);

        return UserProfileResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .githubUsername(githubUsername)
                .role(saved.getRole())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
