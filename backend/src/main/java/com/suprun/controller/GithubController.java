package com.suprun.controller;

import com.suprun.service.GithubService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GithubController {

    private final GithubService service;

    public GithubController(GithubService service) {
        this.service = service;
    }

    @GetMapping("/repos")
    public Object repos() {
        return service.getRepos();
    }
}