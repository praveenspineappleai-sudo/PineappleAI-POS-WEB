const configuredApiUrl = process.env.REACT_APP_API_URL;
const isLocalDevelopment =
	typeof window !== 'undefined' &&
	(window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1');

const defaultApiUrl = isLocalDevelopment
	? 'http://localhost:5000'
	: typeof window !== 'undefined'
		? window.location.origin
		: 'https://pos-web-dev.pineappleai.cloud';

const isConfiguredLocalUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/.test(
	configuredApiUrl || ''
);
const apiUrl = !isLocalDevelopment && isConfiguredLocalUrl
	? defaultApiUrl
	: configuredApiUrl || defaultApiUrl;

export const API_BASE_URL = apiUrl.replace(
	/^http:\/\//,
	isLocalDevelopment ? 'http://' : 'https://'
);
