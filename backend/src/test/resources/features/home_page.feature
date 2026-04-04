Feature: Home Page
  As a user of ChoreTrack
  I want to visit the home page
  So that I can manage my chores

  @acceptance
  Scenario: User visits the home page
    Given the ChoreTrack application is running
    When the user navigates to the home page
    Then the home page is displayed successfully
