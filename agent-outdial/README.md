# Agent Outdial Sample
This sample project demonstrates the integration between Agent Desktop and external applications for the purpose of out-dials, supporting use cases such as frontend click-to-call as well as backend initiated out-dial requests. The project includes two main components:

* JavaScript Agent Desktop widget that listens for out-dial requests and initiates the out-dial call with the Agent Desktop. The compiled widget bundle is deployed to /src/main/resources/static/widget/outdial. You can also find the widget code under /widget folder.
* Java service that acts as a simple message broker between external applications and the Agent Desktop widget. The source code is located under /src/main/java.

### Environment Setup
Ensure you have configured the environment for building and running the Java service with the following installed:

* [Java SE Development Kit](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
* [Apache Maven](https://maven.apache.org/download.cgi)

### Project Setup
Clone or download the project, then from a console window under the project root, run the build command to generate an executable JAR for the Java service
	
	mvn clean package
	
You can now run the JAR package that has been generated under /target folder

	java -jar target/agent-outdial-1.0.jar
	
By default the service base URL is exposed as http://localhost (port 80). You may choose to use a different port by modifying its setting in the application.properties file. This URL needs to be externalized via https protocol and made accessible from the Agent Desktop. For example, https://agentoutdial.mycompany.com. For the demo purposes, you can use something like [ngrok](https://ngrok.com/) to enable a publicly accessible URL the service.

### Desktop Layout
In the /layout/agent-outdial-layout.json, locate the agent-outdial section and replace <host.domain> with the fully qualified hostname where the service is exposed. For example, agentoutdial.mycompany.com. This file can then be uploaded to a Desktop Layout that will be used by the demo agent.

You may also configure an Outdial ANI List and assigned to the agent profile.

### Make Outdial Request
Once the setup has been completed you can now log in an agent and initiate out-dial requests. You can do this from the available test client HTML page, https://agentoutdial.mycompany.com/client.html. Make sure to use the same agent login as the desktop so have the request get routed to the correct agent.

You can also send a request via utility such as Postman, or using cURL command with the example request.json under the /test folder, as shown below.

	curl -X POST -d @request.json https://agentoutdial.mycompany.com/outdial/request

### References
For further references, please consider the following documents:

* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/docs/2.6.4/maven-plugin/reference/html/)
* [Spring Web](https://docs.spring.io/spring-boot/docs/2.6.4/reference/htmlsingle/#boot-features-developing-web-applications)

## Guides
The following guides illustrate how to implement the features and functionality in this sample integration:

* [Webex Contact Center Desktop Developer Guide](https://developer.webex-cx.com/documentation/guides/desktop)
* [Agent Desktop Layout Help Document](https://portal-v2.wxcc-us1.cisco.com/ccone-help-new/index.html#!wcc_g_manage-desktop-layout.html#desktop_layout)
* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/bookmarks/)

