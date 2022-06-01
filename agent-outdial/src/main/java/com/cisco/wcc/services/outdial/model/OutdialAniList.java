package com.cisco.wcc.services.outdial.model;

import java.util.List;

public class OutdialAniList {
	
	private String name;

	private List<OutdialAni> anis;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public List<OutdialAni> getAnis() {
		return anis;
	}

	public void setAnis(List<OutdialAni> anis) {
		this.anis = anis;
	}
}
