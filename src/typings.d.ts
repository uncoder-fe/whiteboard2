declare module '*.css';
declare module '*.less';
// declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg' {
	const content: any;
	export default content;
}
