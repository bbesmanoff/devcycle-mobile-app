package edu.rit.se.trafficanalysis.tracking;

import edu.rit.se.trafficanalysis.TourConfig;
import edu.rit.se.trafficanalysis.util.AlarmUtil;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Class that receives broadcasts when it is time
 * to automatically start tracking the user on
 * the starting line.
 *
 */
public class StartTrackingAlarm extends BroadcastReceiver {
	
	private final static String TAG = StartTrackingAlarm.class.getSimpleName();
	private static final String START_TRACKING_ACTION = "edu.rit.se.trafficanalysis.startTracking";
	
	/**
	 * Set an alarm that signals when to start
	 * tracking the rider.
	 * 
	 * @param context - The Application Context.
	 * @param tourStartTime - unix time in MS (GMT)
	 */
	public static void setAlarm(Context context, long tourStartTime) {
		// set alarm
		AlarmUtil.setAlarm(context, START_TRACKING_ACTION,
				tourStartTime);
	}

	public static void cancelAlarm(Context context) {
		AlarmUtil.cancelAlarm(context, START_TRACKING_ACTION);
	}
	
	@Override
	public void onReceive(Context context, Intent intent) {
		Log.i(TAG, "In start tracking broadcast receiver");
		TimingController.resetBatteryAlarm();
		TrackingService.startTracking(context);
	}

}
