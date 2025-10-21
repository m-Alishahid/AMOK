import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { CronService } from '@/services/cronService';

// This API will be called by a cron job service
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Basic security check
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run both checks
    const expiredCount = await CronService.checkAndExpireDiscounts();
    const activatedCount = await CronService.activateScheduledDiscounts();

    return NextResponse.json({
      success: true,
      data: {
        expired: expiredCount,
        activated: activatedCount,
        timestamp: new Date().toISOString()
      },
      message: `Cron job completed: Expired ${expiredCount}, Activated ${activatedCount}`
    });
  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}