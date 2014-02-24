package edu.rit.se.trafficanalysis.util;

import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.reminders.TourReminderAlarm;
import edu.rit.se.trafficanalysis.tracking.LocationRequestIntentService;
import edu.rit.se.trafficanalysis.tracking.StartTrackingAlarm;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class AlarmUtil {
	private static final String TAG = AlarmUtil.class.getSimpleName();

	public static void unregisterInitialRiderAlarms(Context c) {
		StartTrackingAlarm.cancelAlarm(c);
		TourReminderAlarm.cancelAlarm(c);
	}
	
    public static void registerInitialRiderAlarms(Context c) {
        TourConfig cfg = new TourConfig(c);
        if (cfg.isTourCancelled()) {
                return;
        }

        long curTime = System.currentTimeMillis();

        // Set the alarm for automatic tracking - tour time stored as time passed since epoch in seconds
        // so must convert to ms!
        if (cfg.isAutomaticTrackEnabled() && !cfg.needsUpdatedTimes()
                        && curTime < cfg.getRiderStartTime()*1000) {
                StartTrackingAlarm.setAlarm(c, cfg.getRiderStartTime() * 1000);
        } else {
                StartTrackingAlarm.cancelAlarm(c);
        }
}

	public static void setAlarm(Context c, String action, long time) {
		Intent i = new Intent(action);
		PendingIntent pi = PendingIntent.getBroadcast(c, 0, i,
				PendingIntent.FLAG_UPDATE_CURRENT);
		AlarmManager am = (AlarmManager) c
				.getSystemService(Context.ALARM_SERVICE);
		am.set(AlarmManager.RTC_WAKEUP, time, pi);
		Log.i(TAG, "Alarm Set: " + action);
	}

	public static void cancelAlarm(Context c, String action) {
		Intent intent = new Intent(action);
		PendingIntent pi = PendingIntent.getBroadcast(c, 0, intent,
				PendingIntent.FLAG_UPDATE_CURRENT);
		AlarmManager am = (AlarmManager) c
				.getSystemService(Context.ALARM_SERVICE);
		am.cancel(pi);
		Log.i(TAG, "Alarm Cancelled: " + action);
		
		/*
		if(action == "edu.rit.se.trafficanalysis.requestLocationUpdate"){
			//Kill the location services updates on the pending intent
			LocationRequestIntentService.kill();
	
			WakefulIntentService.acquireStaticLock(c);
			c.startService(new Intent(c,
					LocationRequestIntentService.class));
		} */
	}
}
