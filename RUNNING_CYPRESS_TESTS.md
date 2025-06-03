# How to Run Cypress Tests

This document explains how to run Cypress tests in this project.

## Running Cypress Tests in Headless Mode

To run all Cypress tests in headless mode (without opening the browser), use the following command in your project root directory:

```
npx cypress run
```

This will run all tests matching the spec pattern defined in `cypress.config.js`.

## Running Cypress Tests in Interactive Mode

To open the Cypress Test Runner UI and run tests interactively, use:

```
npx cypress open
```

This will open a GUI where you can select and run individual tests.

## Running Tests with Recording

If you want to record the test runs to the Cypress Dashboard, use:

```
npx cypress run --record --key YOUR_RECORD_KEY
```

Replace `YOUR_RECORD_KEY` with your actual Cypress record key.

## Notes

- Make sure you have installed all dependencies by running `npm install` before running tests.
- The spec files are located in `payment_gateway/cypress/integration/` and are matched by the spec pattern in `cypress.config.js`.
- If you encounter any issues, please check the Cypress documentation at https://docs.cypress.io/.
