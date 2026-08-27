import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/inter/400.css';
import {ContentProvider} from './content';
import {PageShell} from './ui';
import {assetPath,basePath,siteOrigin} from './paths';
export const metadata: Metadata = {
 title: 'A / FORM — Independent Designer',
 description: 'Independent explorations in brand identity, art direction and digital experience. A concept portfolio from Singapore.',
 metadataBase: new URL(siteOrigin),
 alternates:{canonical:siteOrigin+basePath+"/"},
 openGraph: {title:'A / FORM — Independent Designer',description:'Independent explorations in brand identity, art direction and digital experience.',url:siteOrigin+basePath+"/",images:[{url:assetPath('/og.png'),width:1536,height:1024}]},
 twitter:{card:'summary_large_image',title:'A / FORM — Independent Designer',description:'Independent explorations in brand identity, art direction and digital experience.',images:[assetPath('/og.png')]},
 icons:{icon:assetPath('/images/hero-final.png')},
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body><ContentProvider><PageShell>{children}</PageShell></ContentProvider></body></html>;
}
