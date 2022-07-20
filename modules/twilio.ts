import twilio from 'twilio';

export default class Twilio {
  client: twilio.Twilio;

  constructor(accountSid: string, authToken: string) {
    this.client = twilio(accountSid, authToken);
  }

  async getAvailableNumber() {
    // normally you'd do the following, but twilio doesn't differentiate for US (i.e. just use local)
    // see https://stackoverflow.com/questions/39917500/404-error-while-searching-for-twilio-available-phone-number
    // const result = await this.client
    //   .availablePhoneNumbers('GB')
    //   .mobile.list({ limit: 1 });

    const result = await this.client
      .availablePhoneNumbers('US')
      .local.list({ limit: 1 });

    return result[0].phoneNumber;
  }

  async reserve(phoneNumber: string, smsMethod: string, smsUrl: string) {
    // https://www.twilio.com/docs/libraries/reference/twilio-node/3.79.0/Twilio.Api.V2010.AccountContext.IncomingPhoneNumberList.html
    const result = await this.client.incomingPhoneNumbers.create({
      phoneNumber,
      smsMethod,
      smsUrl,
    });

    return result;
  }

  // phoneNumbers() {
  //   const nums = this.client.incomingPhoneNumbers();
  // }
}