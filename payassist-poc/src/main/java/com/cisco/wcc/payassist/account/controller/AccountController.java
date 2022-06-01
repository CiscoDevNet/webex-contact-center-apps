package com.cisco.wcc.payassist.account.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.cisco.wcc.payassist.account.AccountService;

@RestController
@CrossOrigin
@RequestMapping(path="/account")
public class AccountController {

	private static final Logger logger = LoggerFactory.getLogger(AccountController.class);
	
	@Autowired
	private AccountService accountService;
	
	@RequestMapping(path="/id/{id}", method=RequestMethod.DELETE)
	public void deleteAccount(@PathVariable Long id) {
		logger.info("Delete account " + id);
		
		accountService.deleteAccountById(id);
	}
	
	@RequestMapping(path="/cleanup", method=RequestMethod.DELETE)
	public void cleanupRepositories() {
		logger.info("Clean up repositories");
		
		accountService.cleanupRepositories();
	}

}
