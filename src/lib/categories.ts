export interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  description: string;
  variants?: Variant[];
}

export interface Variant {
  type: string; // e.g., "size", "color", "fabric"
  options: string[];
}

export const mockCategories: Category[] = [
  { id: 1, name: "Electronics", description: "Electronic devices and gadgets", status: "Active" },
  { id: 2, name: "Sports", description: "Sports equipment and accessories", status: "Active" },
  { id: 3, name: "Clothing", description: "Clothing and fashion items", status: "Active" },
  { id: 4, name: "Books", description: "Books and educational materials", status: "Active" },
  {
    id: 5,
    name: "New Born",
    description: "Products for newborns",
    status: "Active",
    subcategories: [
      {
        id: 51,
        name: "Baby Boy",
        description: "Clothing and items for baby boys",
        variants: [
          { type: "size", options: ["0-3 months", "3-6 months", "6-9 months"] },
          { type: "color", options: ["Blue", "White", "Green"] },
          { type: "fabric", options: ["Cotton", "Wool", "Silk"] }
        ]
      },
      {
        id: 52,
        name: "Baby Girl",
        description: "Clothing and items for baby girls",
        variants: [
          { type: "size", options: ["0-3 months", "3-6 months", "6-9 months"] },
          { type: "color", options: ["Pink", "White", "Yellow"] },
          { type: "fabric", options: ["Cotton", "Wool", "Silk"] }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "1-2 Years",
    description: "Products for children aged 1-2 years",
    status: "Active",
    subcategories: [
      {
        id: 61,
        name: "Baby Boy",
        description: "Clothing and items for 1-2 year old boys",
        variants: [
          { type: "size", options: ["12-18 months", "18-24 months"] },
          { type: "color", options: ["Blue", "Red", "Green"] },
          { type: "fabric", options: ["Cotton", "Polyester", "Blend"] }
        ]
      },
      {
        id: 62,
        name: "Baby Girl",
        description: "Clothing and items for 1-2 year old girls",
        variants: [
          { type: "size", options: ["12-18 months", "18-24 months"] },
          { type: "color", options: ["Pink", "Purple", "Yellow"] },
          { type: "fabric", options: ["Cotton", "Polyester", "Blend"] }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "3-4 Years",
    description: "Products for children aged 3-4 years",
    status: "Active",
    subcategories: [
      {
        id: 71,
        name: "Baby Boy",
        description: "Clothing and items for 3-4 year old boys",
        variants: [
          { type: "size", options: ["3T", "4T"] },
          { type: "color", options: ["Blue", "Green", "Red"] },
          { type: "fabric", options: ["Cotton", "Polyester", "Blend"] }
        ]
      },
      {
        id: 72,
        name: "Baby Girl",
        description: "Clothing and items for 3-4 year old girls",
        variants: [
          { type: "size", options: ["3T", "4T"] },
          { type: "color", options: ["Pink", "Purple", "Yellow"] },
          { type: "fabric", options: ["Cotton", "Polyester", "Blend"] }
        ]
      }
    ]
  }
];
