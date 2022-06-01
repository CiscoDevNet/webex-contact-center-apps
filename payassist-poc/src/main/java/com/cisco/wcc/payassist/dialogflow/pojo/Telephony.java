package com.cisco.wcc.payassist.dialogflow.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Telephony {

	@JsonProperty("caller_id")
	private String callerId;

	public String getCallerId() {
		return callerId;
	}

	public void setCallerId(String callerId) {
		this.callerId = callerId;
	}
}
