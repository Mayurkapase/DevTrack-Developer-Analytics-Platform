package com.devtrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class SpaWebMvcConfigurer implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        // If file actually exists in static (e.g. assets/*.js, favicon.ico), return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        // Never forward API or documentation endpoints to index.html
                        if (resourcePath.startsWith("api") || resourcePath.startsWith("swagger-ui") 
                                || resourcePath.startsWith("v3/api-docs") || resourcePath.startsWith("h2-console")) {
                            return null;
                        }
                        // Forward all client-side SPA routes to index.html
                        return location.createRelative("index.html");
                    }
                });
    }
}
