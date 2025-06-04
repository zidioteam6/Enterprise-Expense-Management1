package com.expense.management.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

   

//     @Bean
// public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//     http
//         .cors()  // enable CORS support
//         .and()
//         .authorizeHttpRequests(requests -> requests
//             .requestMatchers("/api/expenses/**","/api/auditlogs/**").permitAll()
//             .anyRequest().authenticated())
//         .csrf(csrf -> csrf.disable());

//     return http.build();





@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors()  // Enable CORS
        .and()
        .csrf(csrf -> csrf.disable())  // Disable CSRF for development or API-only backend
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/**",         // ✅ Allow signup and login endpoints
                "/api/expenses/**", 
                "/api/audit/**"
            ).permitAll()
            .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            .anyRequest().authenticated()
        );

    return http.build();
}


}
    



