package com.cisco.wcc.payassist.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

public class DateTimeUtils {

	private static SimpleDateFormat SDTF = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	private static SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd");
	private static String tenantTimezone;
	
	static {
		tenantTimezone = "UTC";
	}
	
	public static String dateString(String epoch) {
		Calendar c =  Calendar.getInstance(
				TimeZone.getTimeZone(tenantTimezone));
		c.setTimeInMillis(Double.valueOf(epoch).longValue());
		SDF.setTimeZone(TimeZone.getTimeZone(tenantTimezone));
		return SDF.format(c.getTime());
	}
	
	public static String dateTimeString(String epoch) {
		Calendar c =  Calendar.getInstance(
				TimeZone.getTimeZone(tenantTimezone));
		c.setTimeInMillis(Double.valueOf(epoch).longValue());
		SDTF.setTimeZone(TimeZone.getTimeZone(tenantTimezone));
		return SDTF.format(c.getTime());
	}
	
	public static String currentDateString() {
		Calendar c =  Calendar.getInstance(
				TimeZone.getTimeZone(tenantTimezone));
		SDF.setTimeZone(TimeZone.getTimeZone(tenantTimezone));
		return SDF.format(c.getTime());
	}
	
	public static String currentDateTimeString() {
		Calendar c =  Calendar.getInstance(
				TimeZone.getTimeZone(tenantTimezone));
		c.setTimeInMillis(System.currentTimeMillis());
		SDTF.setTimeZone(TimeZone.getTimeZone(tenantTimezone));
		return SDTF.format(c.getTime());
	}
}
