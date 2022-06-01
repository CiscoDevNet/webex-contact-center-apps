# Payment Integration Sample
This sample project is created for the purpose of demontrating several use cases for payment gateway integration, including WebexCC Agent Desktop and Google Dialogflow (ES). See sections below for detail about project components and dependencies. 


## Getting Started
Clone / download the project and import it into your IDE workspace. This is a maven project and is based on Spring-Boot framework. All dependencies are already declared in the pom.xml and package.json files.

## Payment Use Case Flow Architecture
Three use cases are covered in this sample integration, illustrated in the flow architecture diagram below.

* Agent using Payment widget to process customer payment
* Agent sending payment link to customer via email or SMS
* Agent transferring customer to Dialogflow for IVR payment processing

![PayAssist Flow Architecture](/wcc-services/pay-assist/doc/payassist-flow-arch.png)

## Java Backend Service
The Java component serves mainly as a backend server for interacting with the payment gateway. The code also contains packages implementing several other functionality in support of the use cases and collaboration between components, as described below. You can add or modify package modules to suite your needs. 

* Account / Order management and screen-pop
* Payment gateway (Braintree sandbox) integration
* Email and SMS service integrations
* REST endpoints and message broker for communication with Agent Desktop and Dialogflow

#### Service Configuration
Required service configuration attributes are kept in the application.properties file under /src/main/resouces/ directory. For demo purpose we're using Braintree sandbox environemnt for payment integration and Amazon SES an SNS services for Email and SMS messaging. You can replace these modules with your own implementations if desired.

#### Running & Packaging
To run the service locally, simply type the command below from the project root directory.
    
    mvn spring-boot:run
    
To create an executable JAR artifact for the serivice, simply type the command below from the project root directory.

    mvn clean package
    
You can then deploy the JAR file found in /target folder and expose an external URL for accessing the service from Dialogflow, Agent Desktop widgets, and via customer payment link.

## Desktop Widgets & Layout
Several sample Agent Desktop widget located under /frontend/src/ directory, which include JS modules for Account, Order, and Payment widgets. These widgets are based simply on Web Component standards that are supported by all majar browsers. Here we're using browserify to bundle the individual widgets for use within the Agent Desktop or standalone HTML pages, but feel free to use any other JS bundler as preferred.

To bundle the Payment widget using browserify for example, run the following command from /frontend directory

    browserify src/payment-widget.js -o build/payment-widget-bundle.js

Then copy the bundle to the project resouces folder to be included in the pay-assist build artifact:

    mv -force build/payment-widget-bundle.js ../src/main/resources/static/desktop/widget/payment/payment-widget-bundle.js

The same can be repeated for other widgets. We do recommend that you define command shortcuts for these tasks within the scripts attribute of the package.json for each of the widgets to ease the build and push process.

Note: A simplified version of the Payment widget (payment-external.js) will be used when the agent sends a payment link to the caller. The JS bundle for this widget is placed under /src/main/resouces/static/external/payment/ directory.

#### Dependency Installation
Run the commands below to download and install the required Node modules if they are missing.

    npm install braintree-web
    npm install -g browserify
    npm install @babel/core --save
    npm install @babel/preset-env --save-dev
    npm install @wxcc-desktop/sdk --save

#### Desktop Layout
The sample Agent Desktop layout.json containing layout definitions for all 3 widgets and can be found under /frontend/layout/ directory. Please refer to the Agent Desktop Developer Guide for detail about the layout sections and structures.

## Dialogflow Payment IVR
The sample Dialogflow (ES) Agent used for IVR (credit card) payment processing can be found under /dialogflow/es/ directory. The fulfillment logics and dependencies are implemented as inline NodeJS cloud function, can be found in the included index.js and package.json.

Simply create a new Dialogflow agent and import the PayAssistIVR.zip. You will need to enable telephony integration and obtain a phone number from Google Phone Gateway so voice caller can reach your virtual agent. You can add training phrases and make changes to intent responses as appropriate.

## Reference
For further references, please check out the following documentation links:

* [Braintree API Reference](https://developer.paypal.com/braintree/docs/reference/overview)
* [Dialogflow ES APIs & References](https://cloud.google.com/dialogflow/es/docs/reference)
* [Amazon Simple Notification Service API Reference](https://docs.aws.amazon.com/sns/latest/api/welcome.html)
* [Amazon Simple Email Service API Reference](https://docs.aws.amazon.com/ses/latest/APIReference/Welcome.html)
* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/2.4.4/maven-plugin/reference/html/)
* [Create an OCI image](https://docs.spring.io/spring-boot/docs/2.4.4/maven-plugin/reference/html/#build-image)
* [Spring Web](https://docs.spring.io/spring-boot/docs/2.4.4/reference/htmlsingle/#boot-features-developing-web-applications)

## Guides
The following guides illustrate how to implement the features and functionality in this sample integration:

* [Webex Contact Center Desktop Developer Guide](https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cust_contact/contact_center/webexcc/developer_20/webexcc_b_20-desktop-developer-guide-/webexcc_m_30-introduction-dev.html)
* [Braintree Developer Guides](https://developer.paypal.com/braintree/docs/guides/overview)
* [Dialogflow ES Guides](https://cloud.google.com/dialogflow/es/docs)
* [Amazon Simple Notification Service Developer Guide](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
* [Amazon Simple Email Service Developer Guide](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/Welcome.html)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/bookmarks/)

