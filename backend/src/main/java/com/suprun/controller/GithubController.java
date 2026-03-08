package com.suprun.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class GithubController {

    @GetMapping("/repos")
    public Object repos() {

        String url = "https://api.github.com/users/yuriisuprun/repos";

        RestTemplate rest = new RestTemplate();

        return rest.getForObject(url, Object.class);
    }

}
