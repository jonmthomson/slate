---
title: "Acceptance Testing"
description: "Learn what goes into writing a great acceptance tests. The guide is tailored to writing tests in the Gherkin domain specific language however the lessons are general and can apply to any method of describing acceptance tests."
language_tabs:
  - gherkin
toc_footers:
includes:
search: true
category: "Guides"
topic: Testing
---

# Acceptance Testing

The following sub-sections of this document detail the specific guidance to be followed when writing acceptance tests for software component functionality.  In each case the guidance is specified as:

* The guidance rule to be followed
* Rationale for the rule.
* Example of the rule.

The sub-sections are as follows:

* General guidance applicable to all acceptance tests
* Feature file guidance which is additional guidance applicable only to Gherkin language feature files
* Acceptance test steps guidance applicable to the underlying StepFlow steps

# General Guidance
The following sub-sections give guidance that is applicable to all acceptance tests.

## Acceptance test shall be written for the correct target audience

```gherkin
# Instead of:
When the user is prompted to "ShortFLOW_A/D_IN (TP319) to ground and hold"

# Use:
When the test engineer simulates a flow sensor open circuit failure by shorting the FLOW_A/D_IN pin (TP319) to ground"
```

Acceptance tests must be able to be understood by Quality Engineers and Auditors who are familiar with the system requirements but may not have detailed product knowledge.


##Acceptance tests must test the complete requirement

```gherkin
# Prove fault actions 
When simulated HPL temperature is set to 75 degrees 
Then humidity shall be disabled 
And the heaterplate relay shall be switched off 
And a HPL_OVER_TEMPERATURE fault shall be logged to engineering log within the fault logging period 
And after the ui fault display period has elapsed 
And "Fault Refer To Manual" shall not have been displayed 

# Prove fault does not recover when therapy is restarted 
When therapy is stopped 
And therapy is started 
Then humidity shall be disabled 
And the heaterplate relay shall be switched off 

# Prove fault does not recover when heaterplate temperature drops 
When simulated HPL temperature is set to 74 degrees 
Then humidity shall be disabled 
And the heaterplate relay shall be switched off
# Prove fault recovers when heaterplate temperature drops (done above) and therapy is restarted
When therapy is stopped
And therapy is started
Then humidity shall be enabled
And the heaterplate relay shall be switched on
And after the ui fault display period has elapsed
Then "Therapy On Home Screen" shall be displayed within the ui nominal screen display period
```

All aspects of requirements must be tested to enable verification that the software meets the requirement.

For example, given the following requirement:

_When the Heaterplate measured temperature is greater than 75 degrees Celsius:_

* _Humidity shall be disabled and heaterplate relay switched off, fault is logged to the engineering log._
* _No fault shall be displayed or logged to the non-volatile fault log._
* _The fault shall recover when the heaterplate temperature drops below 75 degrees Celsius and the user restarts therapy._

The following must be tested:

* When the Heaterplate temperature is greater than 75 degrees Celsius:
  * Humidity is disabled.
  * Heaterplate relay is switched off.
  * No fault is displayed.
  * Fault is logged to the engineering log.
  * No fault is logged to the non-volatile fault log.
* Humidity remains disabled and heaterplate relay remains switched off when user restarts therapy.
* Humidity remains disabled and heaterplate relay remains switched off when heaterplate temperature drops but therapy is not restarted.
* When the heaterplate temperature drops and therapy is restarted:
  * Humidity is enabled.
  * Heaterplate relay is switched on.
  * The fault report is removed from the display.

The example gives a feature scenario that tests this requirement sufficiently.


## All acceptance tests shall be traced to requirements

```gherkin
# This test verifies requirements ID135221 and ID135223.
@TM00001 @SR135221 @SR135223
Scenario Outline: Three access levels are provided via SmartTalk over USB
	When the device is connected at <Level> access level
    Then family shall be equal to "SleepStyle"
```

Requirements shall be traced by including an `@SR[Requirement ID]` tag before the test's scenario description. This allows acceptance tests to be traced to requirements. Additionally this is mandated by SP-38.


## All acceptance tests shall have a unique test method number.

```gherkin
# This test is test method TM00001
@TM00001 @SR135221 @SR135223
Scenario Outline: Three access levels are provided via SmartTalk over USB
    When the device is connected at <Level> access level
    Then family shall be equal to "SleepStyle"
```

Every test scenario must have a unique test identifier which is acheived by including a `@TM[Scenario ID]` tag before each test scenario. This allows requirements to be traced to acceptance tests.


## Acceptance tests that verify risk controls shall be identified as such

```gherkin
# The @RCM tag identifies that this test verifies a risk control
@TM00721 @SR140491 @RCM
Scenario: Bluetooth variant feature shall be available when variant features cannot be determined due to NVM corruption
  ...
```

Risk control mitigators (RCMs) must be held to an even higher standard than regular requirements and consequently acceptance tests must be clearly identified as pertaining to an RCM.

<assert class="notice">
Just the keyword "RCM" is used as the tag, not the full RCM number, traceability is established via the SR tag tracing to the requirement corresponding to the RCM.  This is done to avoid potential conflicts with the PTX.
</assert>


## Prove-test
```gherkin
Scenario: Logging filesystem failure, fault to be logged to engineering log and non-volatile fault log and
          logging to file system disabled

  Given engineering log files are deleted
  And engineering logging to filesystem is set to on
  And therapy is started
  And "Therapy On Home Screen" is displayed within the ui nominal screen display period
  And no LOGGING_FILESYSTEM fault is logged to engineering log
  
  When fault with source logging and code logging filesystem is injected
  Then a LOGGING_FILESYSTEM fault shall be logged to engineering log within the fault logging period
  ...
```

Tests must show that it is the test actions that are the cause of the expected results instead of just a poorly designed test.

This is similar to the standard electrical prove-test-prove method (NZQA Registered Unit Test Standard 15852 Version 6) except the last prove is not needed as we do not need to show the test system is still working correctly after the test.

<aside class="warning">
Exception: Where the test is part of a series of tests testing the same functionality each test does not need the prove step as when taken as a group each test is serving as a prove step to the other tests.
</aside>


## Test boundary cases
Acceptance tests are used to verify adherence to requirements of which robustness around boundary cases is a part. 

As well as testing positive and negative cases acceptance tests must also test boundary cases. See [How To Determine Tolerances](http://nz-issuetrack/default.asp?W1159#sect_HowToDetermineTolerances) for guidance on determining tolerances.

For example, given the requirement:

_A HP Over Temperature fault shall be raised when the HP temperature instantaneously exceeds 85 degC._

The following must be tested:

* When the HP temperature is less than 85 degrees celsius a fault is not raised.
* When the HP temperature exceeds 85 degrees celsius + the measurement tolerance a fault is raised.

It's not sufficient to have a single test that proves the fault is raised at 100 degC.


## Don't use vague language

```gherkin
# Instead of:
...
Then mean leak shall be equal to 10.0

# Use:
...
Then mean leak in compliance data downloaded from the device shall be equal to 10.0
```

In the given example, the first form may be confused with comparing a value read via the SmartTalk streaming interface, the second makes it clear the value being compared is contained in a compliance data file explicitly transferred from the device.


## Don't use pronouns

```gherkin
# Instead of:
Given an ICON2 device...
And it has complete hardware configuration
And tool kikusuipsu is connected
And it is connected

# Use:
Given an ICON2 device...
And it has complete hardware configuration
And tool kikusuipsu is connected
And the device is connected
``` 
```gherkin
# Instead of:
When I start therapy

# Use:
When the user starts therapy
```

* It is not clear what the pronoun it referring to (“it” or “it’s”).  As per Ref 3 and Ref 4
* First person pronouns (“I”) make the work less authoritative. As per Ref 5.


## Avoid the use of the word "should"

``` gherkin
# Instead of:
Given and Icon 2 device
When the user starts therapy
Then therapy should be equal to on

# Use:
Given and Icon 2 device
When the user sharts therapy
Then therapy shall be equal to on
```

"Should" states a non-binding provision and must only be used where appropriate. It is far more common for requirements (and hence acceptance tests) to state binding provisions that use "shall". See Ref 1. 


## Enough time must be left after an action to allow results to be tested

> Positive Test:

```gherkin
# Instead of:
When the simulated HPL temperature is set to 75 degrees
Then a HPL_OVER_TEMPERATURE fault shall be logged to the engineering log

# Use:
When the simulated HPL temperature is set to 75 degrees
Then a HPL_OVER_TEMPERATURE fault shall be logged to the engineering log within the fault logging period
```

> Negative Test:

```gherkin
# Instead of:
When the simulated HPL temperature is set to 74 degrees
Then no HPL_OVER_TEMPERATURE fault shall be logged to the engineering log

# Use:
When the simulated HPL temperature is set to 74 degrees
And after the fault logging period has elapsed
Then no HPL_OVER_TEMPERATURE fault shall be logged to the engineering log 
```

When an action is performed and a certain result expected enough time must be left for the system to react to the action before testing for the desired result.  This is particularly important for negative tests where it is expected that a result does NOT occur.
 
If enough time for the device to respond is not left then a positive test will be unreliable. Likewise, if enough time for the device to respond is not left then a negative test is not testing the correct conditions - it may only be passing because the device has not had enough time to respond rather than because the device does not respond to the stimulus.


## Don't use hard coded delays

```gherkin
# Instead of:
Given the HBT is disconnected
When the user starts therapy
And after 20 seconds
Then the humidity state shall be equal to thermosmart

# Use:
Given the HBT is disconnected
When the user starts therapy
And after the hbt self test period has elapsed
Then the humidity state shall be equal to thermosmart
```

A hard coded delay such as "5 seconds" makes it difficult for the reader to determine why the delay is required. Multiple hard coded delays spread throughout the tests make maintenance difficult, for example if times change.

<aside class="notice">
The dictionary that defines time periods as delay times must be included in the test protocol and test report.
</aside>


## Expect a result within a specific period instead of delaying

```gherkin
# Instead of:
When ok button is short pushed
And after 5 seconds
Then “Confirmation Screen” shall be displayed 

# Use:
When ok button is short pushed
Then “Confirmation Screen” shall be displayed within 5 seconds
```

Instead of setting up pre-conditions, delaying for a set period of time and then expecting to see the result, use a step that expects the result within a specified period of time.

A requirement that states an action must occur within some maximum time period is more properly tested using a step that expects the result within a specified period of time. Not delaying for a set period of time also minimises execution time for the test - in many cases the requirement will have a wide time tolerance to aid in robustness but in normal cases the time taken may be considerably shorter.


## Use tolerances on comparisons

```gherkin
# Instead of:
Then eoh pressure shall be equal to 10.0 cmH2O

# Use:
Then eoh pressure shall be equal to 10.0 cmH2O +/- 0.5 cmH2O

# Or:
Then eoh pressure shall be between 9.5 cmH2O and 10.5 cmH2O
```

Tolerances must be used on numeric comparison tests to ensure tests are robust.  See "How To Determine Tolerances" for guidance on determining tolerances.

Tolerances must be used to make tests robust since the device is interacting with physical sensors where the measured values can not be expected to be exact.


## Use "Given", "When", "Then"

```gherkin
# Instead of:
Scenario: Bluetooth not responding fault shall be logged to engineering log only, 
          but not displayed if both sending and receiving packets failed during Bluetooth initialisation.

  Given therapy is started
  And after the ui therapy starting display period has elapsed
  Then "Therapy On Home Screen" shall be displayed
  And no faults shall be logged to engineering log

  When the user is prompted to "Short the Bluetooth TX (TP503) to ground and hold"
  And the user is prompted to "Short the Bluetooth RX (TP511) to ground and hold"
  Given the device is reset

  # Must wait a long time due to slowness of response from BT module and multiple retries that are attempted
  Then a BLUETOOTH_NOT_RESPONDING fault shall be logged to engineering log within 60 seconds
  And a BLUETOOTH_NOT_RESPONDING fault is not logged to non-volatile fault log
  And display is activated if currently off
  And "Therapy On Home Screen" shall be displayed

# Write as:
Scenario: Bluetooth not responding fault shall be logged to engineering log only, 
          but not displayed if both sending and receiving packets failed during Bluetooth initialisation.

  Given therapy is started
  And after the ui therapy starting display period has elapsed
  And "Therapy On Home Screen" is displayed
  And no faults are logged to engineering log

  When the user is prompted to "Short the Bluetooth TX (TP503) to ground and hold"
  And the user is prompted to "Short the Bluetooth RX (TP511) to ground and hold"
  And the device is reset

  # Must wait a long time due to slowness of response from BT module and multiple retries that are attempted
  Then a BLUETOOTH_NOT_RESPONDING fault shall be logged to engineering log within 60 seconds
  And a BLUETOOTH_NOT_RESPONDING fault is not logged to non-volatile fault log
  And display is activated if currently off
  And "Therapy On Home Screen" shall be displayed
```

Use Given in the steps that setup the test pre-conditions; When for performing the test itself and Then for checking the expected results.

This clearly indicates to the reader what is the setup of the test, the test itself and the checking of the expected results.


## Place comments to indicate why non-obvious actions are performed

```gherkin
# Must start & stop therapy to ensure AATS sees the Therapy Off Home screen
Given the user starts therapy
And the user stops therapy
And after the therapy stopping display period has elapsed
And "Therapy Off Home Screen" is displayed
```

In some cases (typically due to limitations in the AATS) test steps must be performed that are not directly related to testing the requirement.  Such steps must be commented so that a non engineering reader can see why the step must be performed and that the requirement is still being tested correctly.


## Test common functionality once

Repetitive tests slow down execution of the tests and are difficult to maintain without adding value.

For example, the timing out of the therapy off home screen to the standby therapy off home screen only needs to be tested once, not in every subsequent test that ensures other screens transition to the therapy off home screen when therapy is stopped.



# Feature File Guidance

The following sub-sections give detailed guidance specific to the feature files used with Automated Acceptance Tests written in the Gherkin language.

## Scenario descriptions and intents

```gherkin
Scenario: When the heaterplate temperature exceeds 85 degrees celsius humidity is disabled, the heaterplate relay is turned off, a HPL_HIGH_TEMP fault is displayed and logged to the engineering log and non-volatile fault log. Fault can not be recovered from.
```

The scenario description shall describe the intent of the test, that is what test stimuli are induced and the expected results. The description must be kept at a high level, i.e. it does not duplicate every detail that is captured in the test steps.

The scenario description must provide an easy to read summary of what the test is exercising so that the reader can verify that the steps are performing the test correctly and validate that the test is testing the requirement appropriately.

<aside class="warning">
Don't put RCM numbers in scenario descriptions: RCMs are traced via the corresponding requirement and traceability is established using the RCM tag and SR tag.
</aside>



# Acceptance Test Step Guidance

The following guidelines apply specifically to the step definitions used with Automated Acceptance Tests

## Similar steps must be clearly differentiated by their wording

```gherkin
# Instead of steps:
Given therapy is started
# and:
Given therapy is turned on

# Use:
Given therapy is turned on and confirmed to have turned on
# and:
Given therapy is turned on
```

Where there are two or more similar steps then the wording of the steps must clearly identify the differences between the steps.

If steps are not differentiated by their wording then it is not clear to the reader why the step is being used. Undifferentiated steps make it difficult to write new tests as the wrong step may be chosen and the test author has to look at the step implementation to determine why the test is incorrect.  Even wore the test may pass when it should not.

## Use the most restrictive regular expressions that suit the step argument

* Regular expressions that allow invalid characters result in conversion errors (e.g. non-numeric characters for a numeric argument).
* Regular expressions that match 0 or more characters allow steps with missing arguments to be executed with resulting hard to trace failures.
* Greedy regular expressions make it difficult to write distinct steps.

For example:

* Use “\d\+” for integer arguments.
* Instead of "\d*" use "\d+".
* Instead of the step definition `​[StepDefinition(@"(.*) is equal to (.*)")]` which will prevent the following step definition from ever matching, `[StepDefinition(@"compliance value (.*) in file downloaded from the device is equal to compliance value (.*) reported on UI")]`, use more restrictive expressions: `[StepDefinition(@"(\w+*) is equal to (\w+)")]`, `[StepDefinition(@"compliance value (\w+) in file downloaded from the device is equal to compliance value (\w+) reported on UI")]`



# How to Determine Tolerances

Tolerances are to be specified in requirements, where they are not tests must use tolerances determined in consultation with the requirement author (and ideally the requirement corrected to include the tolerances).  Do not determine tolerances by:

1. Choosing such a wide tolerance that it can never be exceeded even in failure cases.
2. Guessing.
3. Measuring the current value and adding a "fudge factor".