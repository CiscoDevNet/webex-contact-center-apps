package com.cisco.wcc.payassist.desktop.broker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Configuration
@EnableWebSocketMessageBroker
public class DesktopMessageBroker implements WebSocketMessageBrokerConfigurer {

	private static final Logger logger = LoggerFactory.getLogger(DesktopMessageBroker.class);

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		logger.info("Register transcripts endpoint");
		registry.addEndpoint("/message-broker").setAllowedOrigins("*");
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry registry) {
		logger.info("Configure desktop message broker");
		registry.enableSimpleBroker("/desktop");
		registry.setApplicationDestinationPrefixes("/");
	}
	
	@EventListener
	public void handleSessionConnected(SessionConnectEvent event) {
		logger.info("Desktop session connect event");
	}
	
	@EventListener
	public void handleSessionConnected(SessionSubscribeEvent event) {
		logger.info("Desktop session subscribe event");
	}
}
