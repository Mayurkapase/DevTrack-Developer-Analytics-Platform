package com.devtrack.service;

import com.devtrack.dto.GithubStatsDto;
import com.devtrack.entity.GithubStats;
import com.devtrack.entity.User;
import com.devtrack.exception.ApiException;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.GithubStatsRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GithubService {

    private static final Logger logger = LoggerFactory.getLogger(GithubService.class);

    private final GithubStatsRepository githubStatsRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${devtrack.github.token:}")
    private String configuredGithubToken;

    public String sanitizeUsername(String input) {
        if (input == null) return "";
        String clean = input.trim();
        if (clean.startsWith("@")) {
            clean = clean.substring(1).trim();
        }
        if (clean.contains("github.com/")) {
            clean = clean.substring(clean.indexOf("github.com/") + "github.com/".length());
        }
        if (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (clean.contains("/")) {
            clean = clean.split("/")[0];
        }
        return clean.trim();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "DevTrack-Platform/1.0");
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        
        String token = configuredGithubToken != null && !configuredGithubToken.trim().isEmpty()
                ? configuredGithubToken.trim()
                : System.getenv("GITHUB_TOKEN");
                
        if (token != null && !token.trim().isEmpty()) {
            headers.set("Authorization", "Bearer " + token.trim());
        }
        return headers;
    }

    @Transactional
    public GithubStatsDto fetchAndSaveGithubStats(User user, String username) {
        String cleanUsername = sanitizeUsername(username);
        if (cleanUsername.isEmpty()) {
            throw new ApiException("GitHub username cannot be empty", HttpStatus.BAD_REQUEST);
        }

        GithubStatsDto fetchedData;
        try {
            fetchedData = queryRealGithubApi(cleanUsername);
        } catch (HttpClientErrorException.Forbidden | HttpClientErrorException.TooManyRequests e) {
            logger.warn("GitHub API rate limit active for {}. Checking for existing saved snapshot.", cleanUsername);
            Optional<GithubStats> existingOpt = githubStatsRepository.findByUserId(user.getId());
            if (existingOpt.isPresent() && cleanUsername.equalsIgnoreCase(existingOpt.get().getGithubUsername())) {
                return mapToDto(existingOpt.get());
            }
            Optional<GithubStats> anyMatch = githubStatsRepository.findByGithubUsername(cleanUsername);
            if (anyMatch.isPresent()) {
                GithubStats cached = anyMatch.get();
                GithubStats stats = existingOpt.orElseGet(() -> GithubStats.builder().user(user).build());
                stats.setGithubUsername(cached.getGithubUsername());
                stats.setName(cached.getName());
                stats.setBio(cached.getBio());
                stats.setCompany(cached.getCompany());
                stats.setLocation(cached.getLocation());
                stats.setAvatarUrl(cached.getAvatarUrl());
                stats.setProfileUrl(cached.getProfileUrl());
                stats.setAccountCreatedAt(cached.getAccountCreatedAt());
                stats.setRepositories(cached.getRepositories());
                stats.setFollowers(cached.getFollowers());
                stats.setFollowing(cached.getFollowing());
                stats.setStars(cached.getStars());
                stats.setTotalForks(cached.getTotalForks());
                stats.setPublicGists(cached.getPublicGists());
                stats.setTopLanguage(cached.getTopLanguage());
                stats.setLanguagesJson(cached.getLanguagesJson());
                stats.setLastUpdated(cached.getLastUpdated());
                GithubStats saved = githubStatsRepository.save(stats);
                return mapToDto(saved);
            }
            throw new ApiException("GitHub API rate limit reached (60 requests/hr for unauthenticated IPs). Please try again shortly or set GITHUB_TOKEN for 5,000 req/hr.", HttpStatus.TOO_MANY_REQUESTS);
        }

        Optional<GithubStats> existingOpt = githubStatsRepository.findByUserId(user.getId());
        GithubStats stats = existingOpt.orElseGet(() -> GithubStats.builder().user(user).build());

        stats.setGithubUsername(fetchedData.getGithubUsername());
        stats.setName(fetchedData.getName());
        stats.setBio(fetchedData.getBio());
        stats.setCompany(fetchedData.getCompany());
        stats.setLocation(fetchedData.getLocation());
        stats.setAvatarUrl(fetchedData.getAvatarUrl());
        stats.setProfileUrl(fetchedData.getProfileUrl());
        stats.setAccountCreatedAt(fetchedData.getAccountCreatedAt());
        stats.setRepositories(fetchedData.getRepositories());
        stats.setFollowers(fetchedData.getFollowers());
        stats.setFollowing(fetchedData.getFollowing());
        stats.setStars(fetchedData.getStars());
        stats.setTotalForks(fetchedData.getTotalForks());
        stats.setPublicGists(fetchedData.getPublicGists());
        stats.setTopLanguage(fetchedData.getTopLanguage());
        stats.setLastUpdated(LocalDateTime.now());

        if (fetchedData.getLanguageDistribution() != null) {
            try {
                stats.setLanguagesJson(objectMapper.writeValueAsString(fetchedData.getLanguageDistribution()));
            } catch (Exception e) {
                logger.warn("Could not serialize languages: {}", e.getMessage());
            }
        }

        GithubStats saved = githubStatsRepository.save(stats);

        fetchedData.setId(saved.getId());
        fetchedData.setUserId(user.getId());

        return fetchedData;
    }

    @Transactional(readOnly = true)
    public GithubStatsDto getStatsByUserId(Long userId) {
        GithubStats stats = githubStatsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("GitHub Stats", "userId", userId));

        return mapToDto(stats);
    }

    @SuppressWarnings("unchecked")
    private GithubStatsDto queryRealGithubApi(String cleanUsername) {
        HttpHeaders headers = createHeaders();
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // 1. GET /users/{username}
            String userUrl = "https://api.github.com/users/" + cleanUsername;
            ResponseEntity<Map> userResponse = restTemplate.exchange(userUrl, HttpMethod.GET, entity, Map.class);
            Map<String, Object> userData = userResponse.getBody();

            if (userData == null) {
                throw new ResourceNotFoundException("GitHub User", "username", cleanUsername);
            }

            String canonicalLogin = userData.get("login") != null ? userData.get("login").toString() : cleanUsername;
            String name = userData.get("name") != null ? userData.get("name").toString() : null;
            String bio = userData.get("bio") != null ? userData.get("bio").toString() : null;
            String company = userData.get("company") != null ? userData.get("company").toString() : null;
            String location = userData.get("location") != null ? userData.get("location").toString() : null;
            String avatarUrl = (String) userData.get("avatar_url");
            String profileUrl = (String) userData.get("html_url");
            if (profileUrl == null || profileUrl.isEmpty()) {
                profileUrl = "https://github.com/" + canonicalLogin;
            }

            LocalDateTime accountCreatedAt = null;
            Object createdAtObj = userData.get("created_at");
            if (createdAtObj instanceof String) {
                try {
                    accountCreatedAt = Instant.parse((String) createdAtObj).atZone(ZoneId.systemDefault()).toLocalDateTime();
                } catch (Exception ex) {
                    logger.debug("Could not parse account created_at: {}", createdAtObj);
                }
            }

            int repos = userData.get("public_repos") instanceof Number ? ((Number) userData.get("public_repos")).intValue() : 0;
            int followers = userData.get("followers") instanceof Number ? ((Number) userData.get("followers")).intValue() : 0;
            int following = userData.get("following") instanceof Number ? ((Number) userData.get("following")).intValue() : 0;
            int publicGists = userData.get("public_gists") instanceof Number ? ((Number) userData.get("public_gists")).intValue() : 0;

            // 2. GET /users/{username}/repos with pagination support (up to 300 repos to prevent rate limits)
            List<Map<String, Object>> repoList = new ArrayList<>();
            int maxPages = Math.min(3, (repos + 99) / 100);
            if (maxPages == 0 && repos > 0) maxPages = 1;

            for (int page = 1; page <= Math.max(1, maxPages); page++) {
                String reposUrl = "https://api.github.com/users/" + canonicalLogin + "/repos?per_page=100&sort=updated&page=" + page;
                try {
                    ResponseEntity<List<Map<String, Object>>> pageResponse = restTemplate.exchange(
                            reposUrl,
                            HttpMethod.GET,
                            entity,
                            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
                    );
                    List<Map<String, Object>> pageRepos = pageResponse.getBody();
                    if (pageRepos != null && !pageRepos.isEmpty()) {
                        repoList.addAll(pageRepos);
                    }
                    if (pageRepos == null || pageRepos.size() < 100) {
                        break;
                    }
                } catch (Exception ex) {
                    logger.warn("Could not fetch repo page {}: {}", page, ex.getMessage());
                    break;
                }
            }

            // 3. Compute Stars and Forks accurately
            int totalStars = 0;
            int totalForks = 0;
            for (Map<String, Object> r : repoList) {
                if (r.get("stargazers_count") instanceof Number) {
                    totalStars += ((Number) r.get("stargazers_count")).intValue();
                }
                if (r.get("forks_count") instanceof Number) {
                    totalForks += ((Number) r.get("forks_count")).intValue();
                }
            }

            // 4. Aggregate languages accurately from repository metadata
            Map<String, Integer> languages = new LinkedHashMap<>();
            if (!repoList.isEmpty()) {
                Map<String, Integer> langCounts = repoList.stream()
                        .map(repo -> repo.get("language"))
                        .filter(Objects::nonNull)
                        .map(Object::toString)
                        .filter(l -> !l.trim().isEmpty())
                        .collect(Collectors.groupingBy(l -> l, Collectors.summingInt(l -> 1)));

                langCounts.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .forEach(e -> languages.put(e.getKey(), e.getValue()));
            }

            String topLanguage = languages.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(repos > 0 ? "General" : "None");

            return GithubStatsDto.builder()
                    .githubUsername(canonicalLogin)
                    .name(name)
                    .bio(bio)
                    .company(company)
                    .location(location)
                    .avatarUrl(avatarUrl)
                    .profileUrl(profileUrl)
                    .accountCreatedAt(accountCreatedAt)
                    .repositories(repos)
                    .followers(followers)
                    .following(following)
                    .stars(totalStars)
                    .totalForks(totalForks)
                    .publicGists(publicGists)
                    .topLanguage(topLanguage)
                    .languageDistribution(languages)
                    .build();

        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("GitHub User", "username", cleanUsername);
        } catch (HttpClientErrorException.Forbidden | HttpClientErrorException.TooManyRequests e) {
            throw e;
        } catch (ResourceAccessException e) {
            logger.error("Network connectivity issue contacting GitHub API: {}", e.getMessage());
            throw new ApiException("Could not connect to GitHub API. Please check your network connection.", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private GithubStatsDto mapToDto(GithubStats stats) {
        Map<String, Integer> languages = new LinkedHashMap<>();
        if (stats.getLanguagesJson() != null && !stats.getLanguagesJson().trim().isEmpty()) {
            try {
                languages = objectMapper.readValue(stats.getLanguagesJson(), new TypeReference<Map<String, Integer>>() {});
            } catch (Exception e) {
                logger.warn("Could not deserialize languages JSON: {}", e.getMessage());
            }
        }
        if (languages.isEmpty() && stats.getTopLanguage() != null && !"None".equals(stats.getTopLanguage())) {
            languages.put(stats.getTopLanguage(), Math.max(1, stats.getRepositories()));
        }

        return GithubStatsDto.builder()
                .id(stats.getId())
                .userId(stats.getUser().getId())
                .githubUsername(stats.getGithubUsername())
                .name(stats.getName())
                .bio(stats.getBio())
                .company(stats.getCompany())
                .location(stats.getLocation())
                .avatarUrl(stats.getAvatarUrl())
                .profileUrl(stats.getProfileUrl())
                .accountCreatedAt(stats.getAccountCreatedAt())
                .repositories(stats.getRepositories())
                .followers(stats.getFollowers())
                .following(stats.getFollowing())
                .stars(stats.getStars())
                .totalForks(stats.getTotalForks())
                .publicGists(stats.getPublicGists())
                .topLanguage(stats.getTopLanguage())
                .languageDistribution(languages)
                .lastUpdated(stats.getLastUpdated())
                .build();
    }
}
