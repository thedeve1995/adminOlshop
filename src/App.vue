<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/shopitems">Shop Items</RouterLink>
    </nav>
  </header>

  <RouterView/>
</template>

<style scoped>
header {
  background-color: red;
  width: 20vw;
  min-height: 100vh;
}

nav{
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

nav a.router-link-exact-active {
  color: blue;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}



</style>
