<<<<<<< HEAD
<<<<<<< HEAD
- [x] Update login page UI to match dashboard theme
  - [x] Add "Child Salon" title at the top
  - [x] Change page background to blue gradient (from-blue-100 to-blue-200)
  - [x] Ensure form has white background
  - [x] Adjust styling to match blue theme
- [x] Remove the blue "S" logo button
- [x] Improve form UI design
=======
# TODO: Implement Add to Cart and Wishlist Functionality

## Steps to Complete

- [x] Create CartContext (src/context/CartContext.js): Handles adding/removing items, persists to localStorage.
- [x] Create WishlistContext (src/context/WishlistContext.js): Similar for wishlist.
- [x] Update src/app/layout.jsx to provide these contexts.
- [x] Modify src/app/product/[id]/page.jsx to use contexts instead of alerts.
- [x] Update Navbar to show cart and wishlist counts.
- [x] Create Cart page (src/app/cart/page.jsx).
- [x] Create Wishlist page (src/app/wishlist/page.jsx).
- [x] Configure Next.js images for Cloudinary.
- [x] Test adding/removing items.
- [x] Make cart and wishlist pages mobile responsive.
>>>>>>> 49d1b75bf7f5611094ca9f7d93c480618252bd33
=======
- [ ] Create global theme/colors file (src/lib/theme.js)
- [ ] Update Navbar.jsx to use global theme and change logo name to "TinyFashion"
- [ ] Update category page to use global theme
- [ ] Pass categories as props to components if needed
- [ ] Test consistency across pages
>>>>>>> e9d6d15623e9299ff95eb88e2db19d6a62e97813
