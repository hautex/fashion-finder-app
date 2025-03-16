import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaSearch, FaShoppingBag, FaTag, FaCheck, FaExclamationTriangle, FaInfoCircle, FaExternalLinkAlt, FaBug, FaTerminal } from 'react-icons/fa';
import { RiShirtLine } from 'react-icons/ri';
import { BiLoaderAlt } from 'react-icons/bi';
import './App.css';

// Résultats de secours pour garantir que l'application fonctionne même sans API
const fallbackResults = {
  success: true,
  analysis: {
    labels: [
      { description: "Dress", score: 0.97 },
      { description: "Clothing", score: 0.96 },
      { description: "Cocktail dress", score: 0.93 },
      { description: "Navy blue", score: 0.92 },
      { description: "Cape", score: 0.91 },
      { description: "Robe", score: 0.90 }
    ],
    colors: [
      { rgb: 'rgb(24, 32, 53)', score: 0.8, pixelFraction: 0.2 },
      { rgb: 'rgb(232, 231, 230)', score: 0.1, pixelFraction: 0.7 }
    ],
    objects: [
      { name: "Dress", confidence: 0.95 },
      { name: "Person", confidence: 0.92 }
    ],
    webEntities: [
      { description: "Cocktail dress", score: 0.92 },
      { description: "Ralph Lauren", score: 0.85 },
      { description: "Fashion", score: 0.8 }
    ]
  },
  searchQuery: "robe cape soirée bleu marine Ralph Lauren",
  similarProducts: [
    {
      title: 'Robe de cocktail à cape en georgette - Ralph Lauren',
      link: 'https://www.ralphlauren.fr/fr/robe-de-cocktail-a-cape-en-georgette-3616533815713.html',
      displayLink: 'www.ralphlauren.fr',
      image: 'https://www.ralphlauren.fr/dw/image/v2/BFQN_PRD/on/demandware.static/-/Sites-rl-products/default/dwe38c9683/images/524867/524867_3001399_pdl.jpg',
      snippet: 'Robe élégante à cape, idéale pour les événements formels et cocktails.',
      price: '€299,00'
    },
    {
      title: 'Robe de Cocktail Cape - Bleu Marine',
      link: 'https://fr.shein.com/Cape-Sleeve-Belted-Navy-Pencil-Dress-p-10351290-cat-1727.html',
      displayLink: 'fr.shein.com',
      image: 'https://img.ltwebstatic.com/images3_pi/2022/12/29/1672297837a31ec85513e2397c9eb0e6c21e3c86a2_thumbnail_600x.jpg',
      snippet: 'Robe fourreau élégante avec cape et ceinture, parfaite pour les occasions spéciales.',
      price: '€22,00'
    },
    {
      title: 'Robe Élégante Midi avec Cape - Collection Soirée',
      link: 'https://www.asos.com/fr/asos-design/asos-design-robe-mi-longue-avec-cape-en-crepe/prd/203080653',
      displayLink: 'www.asos.com',
      image: 'https://images.asos-media.com/products/asos-design-robe-mi-longue-avec-cape-en-crepe/203080653-1-navy',
      snippet: 'Robe midi élégante avec cape intégrée, coupe fluide et ceinture fine.',
      price: '€69,99'
    },
    {
      title: 'Robe Cape Chic - Bleu Nuit',
      link: 'https://www2.hm.com/fr_fr/productpage.1115237001.html',
      displayLink: 'www2.hm.com',
      image: 'https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2F15%2F55%2F15551f6f6719e23707eea5dd232d8333adb2318b.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BLOOKBOOK%5D%2Cres%5Bm%5D%2Chmver%5B1%5D&call=url[file:/product/main]',
      snippet: 'Robe élégante avec effet cape, silhouette structurée et coupe mi-longue.',
      price: '€49,99'
    },
    {
      title: 'Cape-Effect Midi Dress - Navy Blue',
      link: 'https://www.zara.com/fr/fr/robe-mi-longue-effet-cape-p02731168.html',
      displayLink: 'www.zara.com',
      image: 'https://static.zara.net/photos///2023/I/0/1/p/2731/168/401/2/w/563/2731168401_1_1_1.jpg?ts=1693305323400',
      snippet: 'Robe mi-longue avec effet cape élégant, en tissu fluide et coupe structurée.',
      price: '€59,95'
    }
  ]
};
