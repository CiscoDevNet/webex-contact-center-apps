package com.cisco.wcc.services.outdial.service;

import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cisco.wcc.services.outdial.model.OutdialAniList;
import com.cisco.wcc.services.outdial.model.OutdialRequest;

@Service
public class AgentOutdialService {

	private static final Logger logger = LoggerFactory.getLogger(AgentOutdialService.class);

	private ConcurrentHashMap<String, OutdialAniList> aniLists = new ConcurrentHashMap<>();
	
	private ConcurrentHashMap<String, SseEmitter> sseEmitters = new ConcurrentHashMap<>();
	
	public void	addEmitter(String login, SseEmitter emitter) {
		logger.info("Add sse emitter for " + login);

		emitter.onCompletion(() -> {
			logger.info("Sse emitter completed");
			removeEmitter(login);
		});
		emitter.onTimeout(() -> {
			logger.info("Sse emitter timed out");
			removeEmitter(login);
		});
		
		sseEmitters.put(login, emitter);
	}
	
	public void removeEmitter(String login) {
		logger.info("Remove sse emitter for " + login);
		sseEmitters.remove(login);
	}
	
	public void notify(OutdialRequest request) throws Exception {
		logger.info("Send outdial request notification to " + request.getLogin());
		
		SseEmitter emitter = sseEmitters.get(request.getLogin());
		
		if(emitter != null) {
			try {
				emitter.send(SseEmitter.event().data(request));
			} catch(Exception e) {
				logger.error("Emitter notify exception: ", e);
				removeEmitter(request.getLogin());
			}
		} else {
			throw new Exception("Agent not logged in");
		}
	}
	
	public void addAniList(OutdialAniList aniList) {
		logger.info("Add outdial ANI list " + aniList.getName());		
		aniLists.put(aniList.getName(), aniList);
	}
	
	public OutdialAniList getAniList(String name) {
		logger.info("Get outdial ANI list " + name);		
		return aniLists.get(name);
	}
}
