/**
 * Type declarations for CSS modules
 * This allows TypeScript to recognize CSS imports
 */

declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
