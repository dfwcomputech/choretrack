package com.computech.ctui.acceptancetests.steps;

import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;

public class HomePageSteps {

    @LocalServerPort
    private int port;

    @Autowired
    private RestClient.Builder restClientBuilder;

    private ResponseEntity<String> response;

    @Before
    public void setUp() {
        response = null;
    }

    @Given("the ChoreTrack application is running")
    public void theChoreTrackApplicationIsRunning() {
        assertThat(port).isPositive();
        assertThat(restClientBuilder).isNotNull();
    }

    @When("the user navigates to the home page")
    public void theUserNavigatesToTheHomePage() {
        response = restClientBuilder
                .baseUrl("http://localhost:" + port)
                .build()
                .get()
                .uri("/")
                .retrieve()
                .toEntity(String.class);
    }

    @Then("the home page is displayed successfully")
    public void theHomePageIsDisplayedSuccessfully() {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
