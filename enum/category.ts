// lib/category.ts

export class Category {
  // Readable to slugified map
  private static readonly mapping: Record<string, string> = {
    "GI System": "gi-system",
    "Cardiovascular System": "cardiovascular-system",
    "Respiratory": "respiratory",
    "Central Nervous System": "central-nervous-system",
    "Infections": "infections",
    "Endocrine": "endocrine",
    "Obstetrics & Gynecology & Urinary-tract": "obstetrics-gynecology-urinary-tract",
    "Malignant Disease and Immunosuppression": "malignant-disease-immunosuppression",
    "Nutrition & Blood": "nutrition-blood",
    "Musculoskeletal & Joint diseases": "musculoskeletal-joint-diseases",
    "Eye": "eye",
    "Ear Nose Throat": "ear-nose-throat",
    "Skin": "skin",
    "Immunological products & vaccines": "immunological-products-vaccines",
    "Anaesthesia": "anaesthesia",
  };

  /**
   * Get the slug value for a given human-readable label.
   * Falls back to a slugified version of the input if not in mapping.
   */
  static getSlug(label: string): string {
    return this.mapping[label] || this.slugify(label);
  }

  /**
   * Get the human-readable label from a slug.
   * Returns the slug itself if no match is found.
   */
  static getLabel(slug: string): string {
    const reverseMap = Object.entries(this.mapping).reduce(
      (acc, [key, value]) => ({ ...acc, [value]: key }),
      {} as Record<string, string>
    );
    return reverseMap[slug] || slug;
  }

  /**
   * Slugify a string (fallback logic).
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  }

  /**
   * Get all readable labels.
   */
  static getAllLabels(): string[] {
    return Object.keys(this.mapping);
  }

  /**
   * Get all slug values.
   */
  static getAllSlugs(): string[] {
    return Object.values(this.mapping);
  }
}
