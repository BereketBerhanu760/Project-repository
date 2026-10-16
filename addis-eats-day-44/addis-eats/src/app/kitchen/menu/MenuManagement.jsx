"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { removeDish, saveDish, toggleDishVisibility } from "./actions";

function categoryLabel(category) {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MenuManagement({ dishes, categories, error, notice }) {
  const [query, setQuery] = useState("");
  const [editingDish, setEditingDish] = useState(null);
  const filteredDishes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dishes;
    return dishes.filter((dish) => `${dish.name} ${dish.category}`.toLowerCase().includes(normalized));
  }, [dishes, query]);

  return (
    <section className="admin-menu-page" id="menu-management" aria-labelledby="menu-management-heading">
      <div className="menu-management-panel">
        <div className="menu-management-heading">
          <div>
            <p className="eyebrow">Admin workspace</p>
            <h2 id="menu-management-heading">Menu management</h2>
            <p>Manage which dishes customers can browse and order.</p>
          </div>
          <button className="button" type="button" onClick={() => setEditingDish({})}>+ Add new dish</button>
        </div>

        {error ? <p className="menu-admin-message menu-admin-error" role="alert">{error}</p> : null}
        {notice ? <p className="menu-admin-message" role="status">{notice}</p> : null}

        <label className="menu-admin-search">
          <span>Search dishes</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by dish name or category" />
        </label>

        <p className="menu-admin-count" aria-live="polite">{filteredDishes.length} {filteredDishes.length === 1 ? "dish" : "dishes"}</p>
        <div className="menu-admin-table-wrap">
          <table className="menu-admin-table">
            <thead>
              <tr><th scope="col">Image</th><th scope="col">Name</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">Visibility</th><th scope="col">Actions</th></tr>
            </thead>
            <tbody>
              {filteredDishes.map((dish) => (
                <tr key={dish.id}>
                  <td>
                    <Image src={dish.image} alt={dish.imageAlt || dish.name} width={dish.imageWidth} height={dish.imageHeight} sizes="64px" />
                  </td>
                  <th scope="row">{dish.name}</th>
                  <td>{categoryLabel(dish.category)}</td>
                  <td>{dish.price} Birr</td>
                  <td>
                    <form action={toggleDishVisibility}>
                      <input type="hidden" name="dishId" value={dish.id} />
                      <label className="menu-visible-toggle">
                        <input
                          type="checkbox"
                          name="visible"
                          value="true"
                          defaultChecked={dish.visible !== false}
                          onChange={(event) => event.currentTarget.form?.requestSubmit()}
                        />
                        <span>{dish.visible === false ? "Hidden" : "Visible"}</span>
                      </label>
                    </form>
                  </td>
                  <td>
                    <div className="menu-admin-actions">
                      <button className="menu-edit-button" type="button" onClick={() => setEditingDish(dish)}>Edit</button>
                      <form action={removeDish} onSubmit={(event) => {
                        if (!window.confirm(`Delete ${dish.name} from the menu?`)) event.preventDefault();
                      }}>
                        <input type="hidden" name="dishId" value={dish.id} />
                        <button className="menu-delete-button" type="submit">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredDishes.length ? <p className="menu-empty">No dishes match your search.</p> : null}
        </div>
      </div>

      {editingDish !== null ? (
        <div className="menu-modal-backdrop">
          <section className="menu-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-editor-heading">
            <div className="menu-editor-heading">
              <h2 id="menu-editor-heading">{editingDish.id ? "Edit dish" : "Add new dish"}</h2>
              <button className="menu-editor-close" type="button" aria-label="Close dish editor" onClick={() => setEditingDish(null)}>×</button>
            </div>
            <form action={saveDish} className="menu-editor-form">
              {editingDish.id ? <input type="hidden" name="dishId" value={editingDish.id} /> : null}
              <label>Dish name<input name="name" type="text" defaultValue={editingDish.name || ""} maxLength={80} required /></label>
              <label>Category
                <select name="category" defaultValue={editingDish.category || categories[0] || "ethiopian"} required>
                  {categories.map((category) => <option value={category} key={category}>{categoryLabel(category)}</option>)}
                  {!categories.length ? <option value="ethiopian">Ethiopian</option> : null}
                </select>
              </label>
              <label>Price (Birr)<input name="price" type="number" min="1" max="100000" step="1" defaultValue={editingDish.price ?? ""} required /></label>
              <label>Image path<input name="image" type="text" placeholder="/images/doro_wat.jpg" defaultValue={editingDish.image || ""} required /></label>
              <label>Description<textarea name="description" maxLength={500} rows={4} defaultValue={editingDish.description || ""} required /></label>
              <label>Ingredients<input name="ingredients" type="text" placeholder="Comma separated ingredients" defaultValue={editingDish.ingredients?.join(", ") || ""} /></label>
              <div className="menu-editor-actions">
                <button className="menu-edit-button" type="button" onClick={() => setEditingDish(null)}>Cancel</button>
                <button className="button" type="submit">{editingDish.id ? "Update dish" : "Save dish"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}
