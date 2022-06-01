package com.cisco.wcc.payassist.dialogflow.pojo;

import java.util.HashMap;
import java.util.Map;

public enum Source {

	DIALOGFLOW_CONSOLE("DIALOGFLOW_CONSOLE"),
	
	GOOGLE_TELEPHONY("GOOGLE_TELEPHONY");
	
	Source(String source) {
		this.source = source;
	}
	
	private String source;
	
	public String getValue() {
		return this.source;
	}
	
	private static final Map<String, Source> lookup = new HashMap<>();
	
	static {
		for(Source c : Source.values()) {
			lookup.put(c.getValue(), c);
		}
	}
	
	public static Source get(String value) {
		return lookup.get(value);
	}
	
	@Override
	public String toString() {
		return this.getValue();
	}


	private Source name;
	
	public Source getName() {
		return name;
	}

	public void setName(Source name) {
		this.name = name;
	}
}
