// Dapur Kilat — the order board: orders arrive, tick down, and pay out.
// An order is a recipe plus a deadline; serving the matching plate pays
// coins plus a tip for the time left, and keeps the combo alive.
import { MAX_ORDERS, ORDER_TIME, RECIPES, RUSH_AT } from './config.js';

let nextId = 1;

export class OrderBoard {
  constructor() {
    this.orders = [];
    this.spawnIn = 4;
    this.elapsed = 0;
  }

  reset() {
    this.orders = [];
    this.spawnIn = 4;
    this.elapsed = 0;
    nextId = 1;
  }

  get rush() {
    return this.elapsed >= RUSH_AT;
  }

  spawnInterval() {
    // Orders arrive faster as the shift goes on, and faster still in the rush.
    const base = 13 - Math.min(5, this.elapsed / 24);
    return this.rush ? Math.max(6, base - 3) : base;
  }

  orderTime() {
    return this.rush ? 50 : ORDER_TIME;
  }

  pickRecipe() {
    const pool = this.orders.length === 0
      ? RECIPES.filter((r) => r.needs.length <= 2)
      : RECIPES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Returns 'expired' order objects that just ran out (for the buzzer).
  update(dt) {
    this.elapsed += dt;
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.orders.length < MAX_ORDERS) {
      const recipe = this.pickRecipe();
      const tMax = this.orderTime();
      this.orders.push({ id: nextId, name: recipe.name, recipe, tLeft: tMax, tMax });
      nextId += 1;
      this.spawnIn = this.spawnInterval();
    }
    const expired = [];
    for (const order of this.orders) order.tLeft -= dt;
    this.orders = this.orders.filter((order) => {
      if (order.tLeft <= 0) { expired.push(order); return false; }
      return true;
    });
    return expired;
  }

  // A plate matches an order when its ready items are exactly the recipe's.
  findMatch(plateItems) {
    const have = plateItems.map((item) => item.ing).sort().join(',');
    for (const order of this.orders) {
      const want = [...order.recipe.needs].sort().join(',');
      if (have === want) return order;
    }
    return null;
  }

  remove(order) {
    this.orders = this.orders.filter((o) => o.id !== order.id);
  }
}
