// Genre categorization system for Turkish and international music

export const MAIN_GENRES = {
  ANADOLU_ROCK: {
    id: 'anadolu-rock',
    name: 'Anadolu Rock',
    icon: '🎸',
    color: '#e74c3c',
    subGenres: [
      'anadolu rock',
      'turkish rock',
      'psychedelic rock turkish',
      'anatolian rock'
    ]
  },
  ARABESK: {
    id: 'arabesk',
    name: 'Arabesk',
    icon: '🎭',
    color: '#8e44ad',
    subGenres: [
      'arabesk',
      'turkish arabesk',
      'classical arabesk'
    ]
  },
  TURKISH_POP: {
    id: 'turkish-pop',
    name: 'Türk Pop',
    icon: '🎤',
    color: '#3498db',
    subGenres: [
      'turkish pop',
      'pop turkish',
      'modern turkish pop'
    ]
  },
  HALK_MUZIGI: {
    id: 'halk-muzigi',
    name: 'Halk Müziği',
    icon: '🪕',
    color: '#27ae60',
    subGenres: [
      'halk muzigi',
      'turkish folk',
      'folk turkish',
      'traditional turkish'
    ]
  },
  OZGUN_MUZIK: {
    id: 'ozgun-muzik',
    name: 'Özgün Müzik',
    icon: '🎼',
    color: '#f39c12',
    subGenres: [
      'ozgun muzik',
      'turkish alternative',
      'alternative turkish',
      'indie turkish'
    ]
  },
  TURKISH_RAP: {
    id: 'turkish-rap',
    name: 'Türk Rap',
    icon: '🎤',
    color: '#9b59b6',
    subGenres: [
      'turkish hip hop',
      'turkish rap',
      'rap turkish',
      'hip hop turkish'
    ]
  },
  POP: {
    id: 'pop',
    name: 'Pop',
    icon: '🎵',
    color: '#3498db',
    subGenres: [
      'pop',
      'dance pop',
      'electropop',
      'indie pop',
      'synth-pop',
      'art pop',
      'chamber pop',
      'dream pop',
      'power pop',
      'teen pop',
      'europop',
      'k-pop'
    ]
  },
  ROCK: {
    id: 'rock',
    name: 'Rock',
    icon: '🎸',
    color: '#e67e22',
    subGenres: [
      'rock',
      'alternative rock',
      'indie rock',
      'hard rock',
      'punk rock',
      'classic rock',
      'progressive rock',
      'psychedelic rock',
      'garage rock',
      'post-rock',
      'folk rock',
      'blues rock'
    ]
  },
  HIP_HOP: {
    id: 'hip-hop',
    name: 'Hip-Hop & Rap',
    icon: '🎤',
    color: '#9b59b6',
    subGenres: [
      'hip hop',
      'rap',
      'trap',
      'conscious hip hop',
      'gangsta rap',
      'old school hip hop',
      'boom bap',
      'drill',
      'mumble rap',
      'alternative hip hop',
      'underground hip hop',
      'turkish hip hop'
    ]
  },
  ELECTRONIC: {
    id: 'electronic',
    name: 'Electronic',
    icon: '🎛️',
    color: '#1abc9c',
    subGenres: [
      'electronic',
      'house',
      'techno',
      'trance',
      'dubstep',
      'drum and bass',
      'ambient',
      'downtempo',
      'breakbeat',
      'garage',
      'future bass',
      'synthwave'
    ]
  },
  RNB_SOUL: {
    id: 'rnb-soul',
    name: 'R&B & Soul',
    icon: '💫',
    color: '#f39c12',
    subGenres: [
      'r&b',
      'soul',
      'neo soul',
      'contemporary r&b',
      'funk',
      'motown',
      'gospel',
      'blues',
      'smooth jazz',
      'acid jazz'
    ]
  },
  JAZZ: {
    id: 'jazz',
    name: 'Jazz',
    icon: '🎺',
    color: '#34495e',
    subGenres: [
      'jazz',
      'smooth jazz',
      'bebop',
      'swing',
      'fusion',
      'contemporary jazz',
      'latin jazz',
      'cool jazz',
      'free jazz',
      'hard bop'
    ]
  },
  CLASSICAL: {
    id: 'classical',
    name: 'Classical',
    icon: '🎼',
    color: '#8e44ad',
    subGenres: [
      'classical',
      'baroque',
      'romantic',
      'contemporary classical',
      'opera',
      'chamber music',
      'orchestral',
      'piano',
      'violin',
      'cello'
    ]
  },
  WORLD: {
    id: 'world',
    name: 'World Music',
    icon: '🌍',
    color: '#27ae60',
    subGenres: [
      'world music',
      'latin',
      'reggae',
      'african',
      'indian classical',
      'flamenco',
      'celtic',
      'middle eastern',
      'balkan',
      'folk'
    ]
  },
  ALTERNATIVE: {
    id: 'alternative',
    name: 'Alternative & Indie',
    icon: '🎭',
    color: '#95a5a6',
    subGenres: [
      'alternative',
      'indie',
      'experimental',
      'post-punk',
      'shoegaze',
      'grunge',
      'britpop',
      'lo-fi',
      'noise rock',
      'math rock'
    ]
  }
};

export const GENRE_KEYWORDS = {
  'anadolu-rock': ['anadolu rock', 'anatolian rock', 'turkish rock', 'psychedelic rock turkish'],
  'arabesk': ['arabesk', 'turkish arabesk', 'classical arabesk'],
  'turkish-pop': ['turkish pop', 'pop turkish', 'modern turkish pop'],
  'halk-muzigi': ['halk muzigi', 'turkish folk', 'folk turkish', 'traditional turkish'],
  'ozgun-muzik': ['ozgun muzik', 'turkish alternative', 'alternative turkish', 'indie turkish'],
  'turkish-rap': ['turkish hip hop', 'turkish rap', 'rap turkish', 'hip hop turkish'],
  pop: ['pop', 'dance', 'electro', 'synth', 'teen', 'euro', 'k-pop', 'j-pop'],
  rock: ['rock', 'metal', 'punk', 'grunge', 'alternative', 'indie', 'garage', 'psychedelic'],
  'hip-hop': ['hip hop', 'rap', 'trap', 'drill', 'boom bap', 'conscious', 'gangsta', 'underground'],
  electronic: ['electronic', 'house', 'techno', 'trance', 'dubstep', 'ambient', 'synthwave', 'edm'],
  'rnb-soul': ['r&b', 'soul', 'funk', 'motown', 'gospel', 'blues', 'neo soul'],
  jazz: ['jazz', 'bebop', 'swing', 'fusion', 'smooth jazz', 'latin jazz', 'cool jazz'],
  classical: ['classical', 'baroque', 'romantic', 'opera', 'chamber', 'orchestral', 'piano'],
  world: ['world', 'latin', 'reggae', 'african', 'indian', 'flamenco', 'celtic', 'folk'],
  alternative: ['alternative', 'indie', 'experimental', 'post-punk', 'shoegaze', 'lo-fi']
};

// Categorize a single genre
export const categorizeGenre = (genre) => {
  if (!genre || typeof genre !== 'string') return null;
  
  const lowerGenre = genre.toLowerCase();
  
  // Check each main genre
  for (const [categoryId, category] of Object.entries(MAIN_GENRES)) {
    // Check if genre is in subGenres list
    if (category.subGenres.some(subGenre => lowerGenre.includes(subGenre.toLowerCase()))) {
      return {
        mainGenre: category,
        originalGenre: genre,
        confidence: 1.0
      };
    }
    
    // Check keywords
    const keywords = GENRE_KEYWORDS[categoryId] || [];
    const matchingKeywords = keywords.filter(keyword => 
      lowerGenre.includes(keyword.toLowerCase())
    );
    
    if (matchingKeywords.length > 0) {
      return {
        mainGenre: category,
        originalGenre: genre,
        confidence: matchingKeywords.length / keywords.length
      };
    }
  }
  
  // If no match found, return as uncategorized
  return {
    mainGenre: {
      id: 'other',
      name: 'Other',
      icon: '🎶',
      color: '#bdc3c7'
    },
    originalGenre: genre,
    confidence: 0.0
  };
};

// Categorize multiple genres
export const categorizeGenres = (genres) => {
  if (!Array.isArray(genres)) return [];
  
  return genres.map(genre => categorizeGenre(genre)).filter(Boolean);
};

// Get genre statistics
export const getGenreStats = (categorizedGenres) => {
  const stats = {};
  
  categorizedGenres.forEach(({ mainGenre, confidence }) => {
    if (!stats[mainGenre.id]) {
      stats[mainGenre.id] = {
        ...mainGenre,
        count: 0,
        totalConfidence: 0,
        genres: []
      };
    }
    
    stats[mainGenre.id].count += 1;
    stats[mainGenre.id].totalConfidence += confidence;
  });
  
  // Calculate averages and percentages
  const totalGenres = categorizedGenres.length;
  const genreStats = Object.values(stats).map(stat => ({
    ...stat,
    percentage: Math.round((stat.count / totalGenres) * 100),
    averageConfidence: Math.round((stat.totalConfidence / stat.count) * 100) / 100
  }));
  
  // Sort by count (most popular first)
  return genreStats.sort((a, b) => b.count - a.count);
};

// Get genre recommendations based on user's top genres
export const getGenreRecommendations = (userGenres, allGenres = Object.values(MAIN_GENRES)) => {
  const userGenreIds = userGenres.map(g => g.id || g.mainGenre?.id).filter(Boolean);
  
  // Find genres user doesn't have much of
  const recommendations = allGenres.filter(genre => 
    !userGenreIds.includes(genre.id)
  ).slice(0, 5);
  
  return recommendations.map(genre => ({
    ...genre,
    reason: getRecommendationReason(genre, userGenres)
  }));
};

const getRecommendationReason = (recommendedGenre, userGenres) => {
  const reasons = {
    'turkish': 'Explore your local music scene',
    'pop': 'Perfect for mainstream appeal',
    'rock': 'Great for high-energy listening',
    'hip-hop': 'Trending and culturally relevant',
    'electronic': 'Perfect for workouts and focus',
    'rnb-soul': 'Smooth and emotional vibes',
    'jazz': 'Sophisticated and timeless',
    'classical': 'Relaxing and intellectually stimulating',
    'world': 'Expand your cultural horizons',
    'alternative': 'Discover unique and experimental sounds'
  };
  
  return reasons[recommendedGenre.id] || 'Broaden your musical taste';
};

// Filter tracks by genre category
export const filterTracksByGenre = (tracks, genreCategory) => {
  if (!tracks || !Array.isArray(tracks)) return [];
  
  return tracks.filter(track => {
    if (!track.artists) return false;
    
    // Get all genres from all artists of the track
    const trackGenres = track.artists.reduce((genres, artist) => {
      if (artist.genres && Array.isArray(artist.genres)) {
        return [...genres, ...artist.genres];
      }
      return genres;
    }, []);
    
    // Categorize track genres
    const categorizedGenres = categorizeGenres(trackGenres);
    
    // Check if any genre matches the requested category
    return categorizedGenres.some(({ mainGenre }) => 
      mainGenre.id === genreCategory
    );
  });
};

// Get genre diversity score (0-100)
export const getGenreDiversityScore = (genres) => {
  if (!genres || genres.length === 0) return 0;
  
  const uniqueGenres = new Set(genres.map(g => g.toLowerCase()));
  const diversityRatio = uniqueGenres.size / genres.length;
  
  // Bonus points for having genres from different main categories
  const categorized = categorizeGenres(Array.from(uniqueGenres));
  const uniqueCategories = new Set(categorized.map(g => g.mainGenre.id));
  const categoryBonus = Math.min(uniqueCategories.size * 10, 30);
  
  return Math.min(Math.round(diversityRatio * 70 + categoryBonus), 100);
};
