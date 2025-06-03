package com.bankapp.config;

import java.io.IOException;

import org.antlr.v4.runtime.misc.NotNull;
import org.apache.catalina.util.StringUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{

	private final JwtTokenProvider jwtTokenProvider;
	private final UserDetailsService userDetailsService;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		System.out.println("Request Path: " + request.getServletPath());
    	String token = getTokenFromRequest(request);
    	System.out.println("JWT Token: " + token);
		// Skip token validation for login endpoint
		if (request.getServletPath().equals("/api/user/login")) {
			filterChain.doFilter(request, response);
			return;
		}

		if(StringUtils.hasText(token)) {
			try {
				if (jwtTokenProvider.validateToken(token)) {
					String username = jwtTokenProvider.getUsername(token);
					System.out.println("JWT Username: " + username);
					UserDetails userDetails = userDetailsService.loadUserByUsername(username);
					UsernamePasswordAuthenticationToken authenticationToken =
						new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
					authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authenticationToken);
					System.out.println("Authentication set for user: " + username);
				} else {
					System.out.println("Invalid JWT token");
				}
			} catch (Exception e) {
				System.out.println("JWT processing error: " + e.getMessage());
			}
		} else {
			System.out.println("No JWT token found in request");
		}
		filterChain.doFilter(request, response);
	}

	private String getTokenFromRequest(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		if(StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}

}
