import { APP_ID } from '@/constants';
import { sessionId } from './tools'

export const fireSdkLogin = (service, campaign = '') => async () => {
  const sdk = service === '01infinity' ? window.sdk : window.eggSdk;
  const uid = await new Promise(resolve => {
    sdk.app.getDeviceId().then(deviceId => {
      resolve(deviceId)
    });
  })
  const platform = sdk.getPlatform() || 'web'
  const appVersion = sdk.app.getBuildNumber()

  sdk.trackerClient.fire({
    GA: true,
    Piwik: true
  }, {
    category: 'sdk_login',
    action: 'initiate_login',
    label: JSON.stringify({
      account_id: null,
      bucket_id: null,
      login_flow: 'login_without_phone_binding',
      custom_json: {
        uid,
        session_id: sessionId(),
        platform: `${platform}/${APP_ID}/${appVersion}`,
        service,
        campaign,
      }
    })
  });
}

export const infiniteFireSdkLogin = fireSdkLogin('01infinity', '')

export const eggFireSdkLogin = fireSdkLogin('member_egg_2019', '01infinity_welcome_activity')
