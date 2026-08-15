package com.carvo.api.security;

import com.carvo.api.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * "username" here is a Deploro account id, not an email — DeploroAuthFilter resolves the caller
 * to a Deploro account id via a live session check before this ever runs, so lookup is always by
 * that id. Login itself (which does need to match/create by email) goes through
 * UserRepository directly in AuthService, not this service.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String deploroAccountId) throws UsernameNotFoundException {
        return userRepository.findByDeploroAccountId(deploroAccountId)
                .map(CarvoUserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No user linked to Deploro account " + deploroAccountId));
    }
}
