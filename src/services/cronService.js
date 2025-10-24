// // services/cronService.js
// import Discount from '@/Models/Discount';

// export class CronService {
//   // Check and expire discounts automatically
//   static async checkAndExpireDiscounts() {
//     try {
//       console.log('🔍 Checking for expired discounts...');
      
//       const expiredCount = await Discount.checkExpiredDiscounts();
      
//       if (expiredCount > 0) {
//         console.log(`✅ Auto-expired ${expiredCount} discount(s)`);
//       } else {
//         console.log('✅ No expired discounts found');
//       }
      
//       return expiredCount;
//     } catch (error) {
//       console.error('❌ Error checking expired discounts:', error);
//       return 0;
//     }
//   }

//   // Check for scheduled discounts that should become active
//   static async activateScheduledDiscounts() {
//     try {
//       const now = new Date();
      
//       const activatedCount = await Discount.updateMany(
//         {
//           status: 'Scheduled',
//           startDate: { $lte: now },
//           endDate: { $gte: now }
//         },
//         {
//           $set: { status: 'Active' }
//         }
//       );

//       if (activatedCount > 0) {
//         console.log(`✅ Auto-activated ${activatedCount} scheduled discount(s)`);
//       }
      
//       return activatedCount;
//     } catch (error) {
//       console.error('❌ Error activating scheduled discounts:', error);
//       return 0;
//     }
//   }
// }









import Discount from '@/Models/Discount';

export class CronService {
  // Check and expire discounts automatically
  static async checkAndExpireDiscounts() {
    try {
      console.log('🔍 Checking for expired discounts...');
      
      const now = new Date();
      
      // Find active discounts that have expired
      const expiredDiscounts = await Discount.find({
        status: 'Active',
        endDate: { $lt: now },
        autoRemove: true
      });

      console.log(`📋 Found ${expiredDiscounts.length} expired discounts`);

      let expiredCount = 0;
      let totalRestoredProducts = 0;

      for (const discount of expiredDiscounts) {
        try {
          console.log(`⏰ Auto-expiring discount: ${discount.name}`);
          
          // ✅ USE removeFromProducts to restore original prices
          const restoredCount = await discount.removeFromProducts();
          
          totalRestoredProducts += restoredCount;
          expiredCount++;
          
          console.log(`✅ Auto-expired "${discount.name}" - ${restoredCount} products restored`);
        } catch (error) {
          console.error(`❌ Error auto-expiring discount ${discount.name}:`, error);
        }
      }

      if (expiredCount > 0) {
        console.log(`✅ Auto-expired ${expiredCount} discount(s) - ${totalRestoredProducts} products restored`);
      } else {
        console.log('✅ No expired discounts found');
      }
      
      return expiredCount;
    } catch (error) {
      console.error('❌ Error checking expired discounts:', error);
      return 0;
    }
  }

  // Check for scheduled discounts that should become active
  static async activateScheduledDiscounts() {
    try {
      const now = new Date();
      
      console.log('🔍 Checking for scheduled discounts to activate...');
      
      // Find scheduled discounts that should be active
      const scheduledDiscounts = await Discount.find({
        status: 'Scheduled',
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      console.log(`📋 Found ${scheduledDiscounts.length} scheduled discounts to activate`);

      let activatedCount = 0;
      let totalAppliedProducts = 0;

      for (const discount of scheduledDiscounts) {
        try {
          console.log(`🎯 Auto-activating discount: ${discount.name}`);
          
          // Update status to Active
          discount.status = 'Active';
          await discount.save();
          
          // ✅ Apply discount to products
          await discount.applyToProducts();
          
          activatedCount++;
          totalAppliedProducts += discount.totalProducts || 0;
          
          console.log(`✅ Auto-activated "${discount.name}" - applied to ${discount.totalProducts} products`);
        } catch (error) {
          console.error(`❌ Error auto-activating discount ${discount.name}:`, error);
        }
      }

      if (activatedCount > 0) {
        console.log(`✅ Auto-activated ${activatedCount} discount(s) - applied to ${totalAppliedProducts} products`);
      }
      
      return activatedCount;
    } catch (error) {
      console.error('❌ Error activating scheduled discounts:', error);
      return 0;
    }
  }
}