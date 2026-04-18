package com.computech.ctui.acceptancetests.steps;

import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

public class HomePageSteps {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = new RestTemplate();

    private ResponseEntity<String> response;

    @Before
    public void setUp() {
        response = null;
    }

    @Given("the ChoreTrack application is running")
    public void theChoreTrackApplicationIsRunning() {
        assertThat(port).isPositive();
    }

    @When("the user navigates to the home page")
    public void theUserNavigatesToTheHomePage() {
        response = restTemplate.getForEntity("http://localhost:" + port + "/", String.class);
    }

    @Then("the home page is displayed successfully")
    public void theHomePageIsDisplayedSuccessfully() {
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
