package com.suprun.service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GithubService {

    @Cacheable("repos")
    public Object getRepos() {

        String url = "https://api.github.com/users/yuriisuprun/repos";

        RestTemplate rest = new RestTemplate();

        return rest.getForObject(url, Object.class);
    }
}