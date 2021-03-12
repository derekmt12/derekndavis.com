export default async function subscribe(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const apiKey = process.env.MAILCHIMP_API_KEY;
    // API keys are in the form <key>-us3.
    const dataCenter = apiKey.split('-')[1];

    const response = await fetch(
      `https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({
          // TODO: how do I send the first name in the request???
          email_address: email,
          // the status of 'subscribed' is equivalent to a double opt-in.
          status: 'subscribed',
        }),
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // swallow any errors from Mailchimp and return a better error message.
    if (response.status >= 400) {
      return res.status(400).json({
        error: `There was an error subscribing to the newsletter. DM me on Twitter @derekmt12 and I'll add you to the list.`,
      });
    }

    return res.status(201).json({ error: '' });
  } catch (error) {
    return res.status(500).json({ error: error.message || error.toString() });
  }
}
