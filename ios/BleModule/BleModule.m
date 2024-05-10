#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventDispatcher.h"

@interface RCT_EXTERN_MODULE(BleModule, NSObject)

RCT_EXTERN_METHOD(start:
                  (NSDictionary *)options
                  callback:(RCTResponseSenderBlock) callback)

RCT_EXTERN_METHOD(scan:
                  (NSArray *)serviceUUIDStrings
                  timeoutSeconds:(nonnull NSNumber *)timeoutSeconds
                  allowDuplicates:(BOOL)allowDuplicates
                  scanningOptions:(nonnull NSDictionary*)scanningOptions
                  callback:(nonnull RCTResponseSenderBlock)callback)

@end
