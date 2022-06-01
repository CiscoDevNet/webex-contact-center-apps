package com.cisco.wcc.services.outdial.controller;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.cisco.wcc.services.outdial.model.OutdialAniList;
import com.cisco.wcc.services.outdial.model.OutdialRequest;
import com.cisco.wcc.services.outdial.service.AgentOutdialService;

@RestController
@CrossOrigin
@RequestMapping(path="/outdial")
public class AgentOutdialController {
	
	private static final Logger logger = LoggerFactory.getLogger(AgentOutdialController.class);

	@Autowired
	private AgentOutdialService agentOutdialService;
	
	@GetMapping("/listen/{login}")
	public ResponseEntity<SseEmitter> listen(@PathVariable String login) throws InterruptedException, IOException {
		logger.info("Outdial listening request from " + login);
		
		final SseEmitter emitter = new SseEmitter(43200000L); // 12-hour session		
		agentOutdialService.addEmitter(login, emitter);
		
		return new ResponseEntity<>(emitter, HttpStatus.OK);		
	}
	
	@PostMapping("/request")
	public ResponseEntity<String> request(@RequestBody OutdialRequest request) {
		logger.info("Outdial request for " + request.getLogin());
		HttpStatus status = HttpStatus.OK;
		String message = "Request sent";
		try {
			agentOutdialService.notify(request);
		} catch(Exception e) {
			status = HttpStatus.NOT_FOUND;
			message = e.getMessage();
		}		
		
		return new ResponseEntity<>(message, status);
	}
	
	@PostMapping("/anis")
	public ResponseEntity<String> anis(@RequestBody OutdialAniList aniList) {
		logger.info("Post outdial ANI list " + aniList.getName());
		agentOutdialService.addAniList(aniList);
		
		return new ResponseEntity<>("GOT IT!", HttpStatus.ACCEPTED);
	}
	
	@GetMapping("/anis/{name}")
	public ResponseEntity<OutdialAniList> anis(@PathVariable String name) {
		logger.info("Get outdial ANI list " + name);
		HttpStatus status = HttpStatus.OK;
		
		OutdialAniList oal = agentOutdialService.getAniList(name);
		if(oal == null) {
			status = HttpStatus.NOT_FOUND;
		}
		
		return new ResponseEntity<>(oal, status);
	}
}
