package com.suprun.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GithubServiceTest {

    private GithubService githubService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestTemplate restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);

        githubService = new GithubService(restTemplate);
        ReflectionTestUtils.setField(githubService, "githubToken", "test-token");
    }

    @Test
    void getRepos_shouldCallGithubApi_andReturnResponseBody() {
        String mockResponse = "[{\"name\":\"repo1\"}]";

        mockServer.expect(requestTo("https://api.github.com/users/yuriisuprun/repos"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "Bearer test-token"))
                .andExpect(header("Accept", "application/vnd.github+json"))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        Object result = githubService.getRepos();

        mockServer.verify();

        assertThat(result).isNotNull();
        assertThat(result.toString()).contains("repo1");
    }

    @Test
    void getRepos_withoutToken_shouldNotSendAuthorizationHeader() {
        ReflectionTestUtils.setField(githubService, "githubToken", "   ");

        String mockResponse = "[]";

        mockServer.expect(requestTo("https://api.github.com/users/yuriisuprun/repos"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(headerDoesNotExist("Authorization"))
                .andExpect(header("Accept", "application/vnd.github+json"))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        Object result = githubService.getRepos();

        mockServer.verify();

        assertThat(result).isNotNull();
    }

    @Test
    void getRepos_shouldHandleServerError() {
        mockServer.expect(requestTo("https://api.github.com/users/yuriisuprun/repos"))
                .andRespond(withServerError());

        try {
            githubService.getRepos();
        } catch (Exception ex) {
            assertThat(ex).isNotNull();
        }

        mockServer.verify();
    }
}
