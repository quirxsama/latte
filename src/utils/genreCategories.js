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
  ACOUSTIC: {
    id: 'acoustic',
    name: 'Acoustic',
    icon: '🎸',
    color: '#d4a574',
    subGenres: ['acoustic', 'singer-songwriter', 'folk acoustic', 'unplugged']
  },
  AFROBEAT: {
    id: 'afrobeat',
    name: 'Afrobeat',
    icon: '🥁',
    color: '#ff6b35',
    subGenres: ['afrobeat', 'afro-pop', 'african']
  },
  BLUES: {
    id: 'blues',
    name: 'Blues',
    icon: '🎺',
    color: '#4a90e2',
    subGenres: ['blues', 'chicago blues', 'delta blues', 'electric blues']
  },
  BOSSANOVA: {
    id: 'bossanova',
    name: 'Bossa Nova',
    icon: '🌴',
    color: '#f39c12',
    subGenres: ['bossanova', 'bossa nova', 'brazilian']
  },
  COUNTRY: {
    id: 'country',
    name: 'Country',
    icon: '🤠',
    color: '#8b4513',
    subGenres: ['country', 'bluegrass', 'americana', 'alt-country']
  },
  DISCO: {
    id: 'disco',
    name: 'Disco',
    icon: '🕺',
    color: '#ff69b4',
    subGenres: ['disco', 'funk', 'nu-disco', 'boogie']
  },
  DRUM_AND_BASS: {
    id: 'drum-and-bass',
    name: 'Drum & Bass',
    icon: '🥁',
    color: '#00ff00',
    subGenres: ['drum-and-bass', 'dnb', 'jungle', 'liquid-dnb']
  },
  DUB: {
    id: 'dub',
    name: 'Dub',
    icon: '🔊',
    color: '#32cd32',
    subGenres: ['dub', 'dubstep', 'dub-techno']
  },
  GOSPEL: {
    id: 'gospel',
    name: 'Gospel',
    icon: '⛪',
    color: '#ffd700',
    subGenres: ['gospel', 'contemporary gospel', 'southern gospel']
  },
  GRUNGE: {
    id: 'grunge',
    name: 'Grunge',
    icon: '🎸',
    color: '#696969',
    subGenres: ['grunge', 'alternative rock', 'post-grunge']
  },
  INDIE: {
    id: 'indie',
    name: 'Indie',
    icon: '🎭',
    color: '#ff6347',
    subGenres: ['indie', 'indie-pop', 'indie-rock', 'indie-folk']
  },
  LATIN: {
    id: 'latin',
    name: 'Latin',
    icon: '💃',
    color: '#ff4500',
    subGenres: ['latin', 'salsa', 'reggaeton', 'bachata', 'merengue']
  },
  METAL: {
    id: 'metal',
    name: 'Metal',
    icon: '🤘',
    color: '#000000',
    subGenres: ['metal', 'heavy-metal', 'death-metal', 'black-metal']
  },
  PUNK: {
    id: 'punk',
    name: 'Punk',
    icon: '🔥',
    color: '#dc143c',
    subGenres: ['punk', 'punk-rock', 'hardcore', 'pop-punk']
  },
  REGGAE: {
    id: 'reggae',
    name: 'Reggae',
    icon: '🇯🇲',
    color: '#228b22',
    subGenres: ['reggae', 'dancehall', 'ska', 'rocksteady']
  },
  SOUL: {
    id: 'soul',
    name: 'Soul',
    icon: '💫',
    color: '#9370db',
    subGenres: ['soul', 'motown', 'northern soul', 'southern soul']
  },
  TANGO: {
    id: 'tango',
    name: 'Tango',
    icon: '💃',
    color: '#8b0000',
    subGenres: ['tango', 'nuevo tango', 'tango argentino']
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

// Categorize a single genre and return the best match
export const categorizeGenre = (genre) => {
  if (!genre || typeof genre !== 'string') return null;

  const lowerGenre = genre.toLowerCase();
  let bestMatch = null;
  let bestConfidence = 0;

  // Check each main genre
  for (const [categoryId, category] of Object.entries(MAIN_GENRES)) {
    // Check if genre is in subGenres list (highest priority)
    if (category.subGenres.some(subGenre => lowerGenre.includes(subGenre.toLowerCase()))) {
      return {
        mainGenre: category,
        originalGenre: genre,
        confidence: 1.0
      };
    }

    // Check keywords (lower priority)
    const keywords = GENRE_KEYWORDS[categoryId] || [];
    const matchingKeywords = keywords.filter(keyword =>
      lowerGenre.includes(keyword.toLowerCase())
    );

    if (matchingKeywords.length > 0) {
      const confidence = matchingKeywords.length / keywords.length;
      if (confidence > bestConfidence) {
        bestMatch = {
          mainGenre: category,
          originalGenre: genre,
          confidence
        };
        bestConfidence = confidence;
      }
    }
  }

  // Return best match or uncategorized
  return bestMatch || {
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

// Get the primary genre for a track (most confident match)
export const getPrimaryGenre = (genres) => {
  if (!Array.isArray(genres) || genres.length === 0) return null;

  const categorizedGenres = genres.map(genre => categorizeGenre(genre)).filter(Boolean);

  if (categorizedGenres.length === 0) return null;

  // Sort by confidence and return the best match
  categorizedGenres.sort((a, b) => b.confidence - a.confidence);
  return categorizedGenres[0];
};

// Categorize multiple genres
export const categorizeGenres = (genres) => {
  if (!Array.isArray(genres)) return [];
  
  return genres.map(genre => categorizeGenre(genre)).filter(Boolean);
};

// Get genre statistics from tracks
export const getGenreStatsFromTracks = (tracks) => {
  const stats = {};
  const totalTracks = tracks.length;

  console.log(`Processing ${totalTracks} tracks for genre stats`);

  tracks.forEach((track, index) => {
    if (!track.artists) return;

    // Get all genres from all artists of the track
    const trackGenres = track.artists.reduce((genres, artist) => {
      if (artist.genres && Array.isArray(artist.genres)) {
        return [...genres, ...artist.genres];
      }
      return genres;
    }, []);

    // Get primary genre for this track
    const primaryGenre = getPrimaryGenre(trackGenres);

    if (primaryGenre) {
      const genreId = primaryGenre.mainGenre.id;

      if (index < 3) { // Debug first 3 tracks
        console.log(`Track "${track.name}" -> Primary genre: ${primaryGenre.mainGenre.name} (${genreId})`);
      }

      if (!stats[genreId]) {
        stats[genreId] = {
          ...primaryGenre.mainGenre,
          count: 0,
          totalConfidence: 0
        };
      }

      stats[genreId].count += 1;
      stats[genreId].totalConfidence += primaryGenre.confidence;
    } else if (index < 3) {
      console.log(`Track "${track.name}" -> No primary genre found, genres:`, trackGenres);
    }
  });

  // Calculate averages and percentages
  const genreStats = Object.values(stats).map(stat => ({
    ...stat,
    percentage: Math.round((stat.count / totalTracks) * 100),
    averageConfidence: Math.round((stat.totalConfidence / stat.count) * 100) / 100
  }));

  console.log('Final genre stats:', genreStats.map(s => `${s.name}: ${s.count} tracks`));

  // Sort by count (most popular first)
  return genreStats.sort((a, b) => b.count - a.count);
};

// Legacy function for backward compatibility
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

// Filter tracks by genre category using primary genre only
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

    // Get primary genre for this track
    const primaryGenre = getPrimaryGenre(trackGenres);

    // Check if primary genre matches the requested category
    return primaryGenre && primaryGenre.mainGenre.id === genreCategory;
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
