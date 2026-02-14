/* Datos editables del sitio
   - Para agregar publicaciones: sumá un objeto en `posts` (lo más nuevo arriba).
   - Para agregar noticias: sumá un objeto en `news` (lo más nuevo arriba).
*/
window.SITE_DATA = {
  posts: [
    {
      id: "ig-post-1",
      platform: "instagram",
      date: "2026-02-09",
      title: "Publicación destacada",
      text: "",
      url: "https://www.instagram.com/p/DUBMB0fjs2k/",
      embed: true
    },
    {
      id: "ig-reel-2",
      platform: "instagram",
      date: "2026-02-08",
      title: "Reel destacado",
      text: "",
      url: "https://www.instagram.com/reel/DTsopx4Dk3B/",
      embed: true
    }
  ],

  // Noticias: por ahora dejamos la sección como “Próximamente”
  news: [
    {
      id: "n-1",
      category: "campaña",
      date: "2026-02-10",
      title: "Reunión con vecinos y comisiones barriales",
      excerpt: "Escuchamos prioridades del barrio y definimos una agenda de gestión con obras y servicios.",
      url: ""
    },
    {
      id: "n-2",
      category: "ciudad",
      date: "2026-02-06",
      title: "Recorrida por instituciones educativas y deportivas",
      excerpt: "Conversamos sobre necesidades de infraestructura y apoyo a actividades para jóvenes.",
      url: ""
    },
    {
      id: "n-3",
      category: "deporte",
      date: "2026-02-03",
      title: "Apoyo al deporte local y eventos comunitarios",
      excerpt: "Impulsamos espacios seguros y oportunidades para clubes y escuelas deportivas.",
      url: ""
    }
  ]
};
