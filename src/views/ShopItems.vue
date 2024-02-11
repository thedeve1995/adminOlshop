<template>
  <div class="shop">
    <h1>Your Shop Items Here</h1>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>In Cart</th>
            <th>Image</th>
            <th>Gender</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in itemData" :key="data.id">
            <td>{{ data.id }}</td>
            <td>{{ data.namaBarang }}</td>
            <td>Rp {{ data.harga }}</td>
            <td>{{ data.stok }}</td>
            <td>{{ data.inCart }}</td>
            <td style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 10px;">
              <div id="img-con" v-for="(link, index) in data.linkImage">
                <img :src="link" width="50" height="50" alt="">
                <button @click="deleteImg(data.id, index)">X</button>
              </div>
            </td>

            <td>{{ data.gender }}</td>
            <td>{{ data.kategori }}</td>
            <td style="max-width: 100px;">
              <div class="btnGrp">
                <button @click="edit(data.id)">edit</button>
                <button @click="deleteBtn(data.id)">delete</button>
              </div>
            </td>
          </tr>

        </tbody>
      </table>
      <!-- <div class="card">
        <img src="../assets/product/1.jpg" width="250" height="250" alt="">

        <div class="judul-heart">
          <span class="judul">Baju gamis mewah</span>
        </div>

        <div class="harga-btnCon">
          <span class="harga"><sup>Rp</sup>80.000</span>
        </div>
      </div> -->
    </div>
    <h2 style="text-align: center;margin: 20px 0;">Add Shop Items</h2>
    <form id="form-addItem" @submit.prevent="addItem">
      <div class="input-con">
        <label for="nama-barang">Nama Barang</label>
        <input v-model="namaBarang" type="text" id="nama-barang">
      </div>
      <div class="input-con">
        <label for="harga">Harga</label>
        <input v-model="harga" type="number" id="harga">
      </div>
      <div class="input-con">
        <label for="stok">Stok</label>
        <input v-model="stok" type="number" id="stok">
      </div>
      <div class="input-con">
        <label for="nama-barang">Upload Gambar</label>
        <input @change="handleImageUpload" type="file" id="nama-barang" multiple>
      </div>
      <div class="input-con">
        <label for="gender">Gender</label>
        <select v-model="gender" name="" id="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div class="input-con">
        <label for="kategori">Kategori</label>
        <select v-model="kategori" name="" id="">
          <option value="aksesoris">Aksesoris</option>
          <option value="upper">Upper</option>
          <option value="downer">Downer</option>
        </select>
      </div>
      <div class="input-con">
        <label for="deskripsi">Deskripsi</label>
      </div>
      <button type="submit">Add Item</button>
    </form>
  </div>
  <div v-if="showEditModal" class="modal">
    <div class="modal-content">
      <!-- Your edit form goes here -->
      <label for="edited-nama-barang">Nama Barang</label>
      <input v-model="editedData.namaBarang" type="text" id="edited-nama-barang">

      <label for="edited-harga">Harga</label>
      <input v-model="editedData.harga" type="number" id="edited-harga">

      <label for="edited-stok">Stok</label>
      <input v-model="editedData.stok" type="number" id="edited-stok">

      <label for="edited-gender">Gender</label>
      <select v-model="editedData.gender" id="edited-gender">
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <label for="edited-kategori">Kategori</label>
      <select v-model="editedData.kategori" id="edited-kategori">
        <option value="aksesoris">Aksesoris</option>
        <option value="upper">Upper</option>
        <option value="downer">Downer</option>
      </select>

      <button style="background-color: #3498db;" @click="saveEdit">Save</button>
      <button style="background-color: rgb(255, 98, 0)" @click="closeModal">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import Quill from 'quill/core';
import { ref, onMounted } from 'vue';
import {
  setDoc,
  collection,
  doc, query, orderBy, onSnapshot, deleteDoc, getDoc, updateDoc, getDocs, where
} from 'firebase/firestore'
import { db } from '@/firebase'
import { storage } from '@/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'


const namaBarang = ref("")
const harga = ref("")
const stok = ref("")
const gender = ref("")
const kategori = ref("")
const linkImage = ref([])
let selectedImageFile = null
let imageRef


const itemData = ref([]);

const dataCollectionQuery = query(
  collection(db, "dataBarang"),
  orderBy("stok", "asc")
  // limit(10)
);

const loadData = () => {
  onSnapshot(dataCollectionQuery, async (querySnapshot) => {
    const fbData = [];

    // Fetch all user documents
    const userCollection = collection(db, "user");
    const allUserDocs = await getDocs(userCollection);

    querySnapshot.forEach(async (doc) => {
      const data = {
        id: doc.id,
        namaBarang: doc.data().namaBarang,
        harga: doc.data().harga,
        stok: doc.data().stok,
        gender: doc.data().gender,
        kategori: doc.data().kategori,
        linkImage: doc.data().linkImage,
        inCart: 0, // Initialize inCart field to 0
      };

      // Iterate over all user documents
      allUserDocs.forEach((userDoc) => {
        const cartItems = userDoc.data().cart;

        // Check if the cart contains the current item
        const cartItem = cartItems.find(item => item.id === data.id);
        if (cartItem) {
          // If yes, add the quantity to the inCart field
          data.inCart += cartItem.quantity;
        }
      });

      fbData.push(data);
    });

    itemData.value = fbData;
  });
};

onMounted(() => {
  loadData();
});



const addItem = async () => {
  try {
    if (selectedImageFile && selectedImageFile.length > 0) {
      // Upload each image to Firebase Storage
      const uploadedImageUrls = await Promise.all(
        selectedImageFile.map(async (file) => {
          const imageRef = storageRef(storage, file.name);
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // Update the linkImage array with the image URLs
      linkImage.value = uploadedImageUrls;
    }

    const recordItem = {
      namaBarang: namaBarang.value,
      harga: harga.value,
      stok: stok.value,
      gender: gender.value,
      kategori: kategori.value,
      linkImage: linkImage.value,
      deskripsi: quill.value.root.innerHTML,
    };

    // Add the data to Firestore
    await setDoc(doc(collection(db, 'dataBarang')), recordItem);

    // Clear form values
    namaBarang.value = '';
    harga.value = '';
    stok.value = '';
    gender.value = '';
    kategori.value = '';
    linkImage.value = [];
    selectedImageFile = null;

    alert('Successfully Uploaded!');
  } catch (error) {
    console.error(error);
  }
};

const handleImageUpload = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    // Store the selected files in selectedImageFile array
    selectedImageFile = Array.from(files);
  }
};


const deleteBtn = async (itemId) => {
  try {
    const itemRef = doc(db, 'dataBarang', itemId);
    await deleteDoc(itemRef);
    alert('Item deleted successfully!');
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

const deleteImg = async (itemId, index) => {
  try {
    // Get the document reference
    const itemRef = doc(db, 'dataBarang', itemId);

    // Get the current data of the document
    const itemSnapshot = await getDoc(itemRef);
    const currentData = itemSnapshot.data();

    // Remove the image link at the specified index from the linkImage array
    currentData.linkImage.splice(index, 1);

    // Update the document with the modified data
    await updateDoc(itemRef, {
      linkImage: currentData.linkImage,
    });

    alert('Image deleted successfully!');
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

const editedData = ref({
  id: null,
  namaBarang: '',
  harga: '',
  stok: '',
  gender: '',
  kategori: '',
});
const showEditModal = ref(false)
const edit = (dataId) => {
  showEditModal.value = true

  const selectedItem = itemData.value.find(item => item.id === dataId);

  // Update the editedData with the values from the selected item
  editedData.value = {
    id: selectedItem.id,
    namaBarang: selectedItem.namaBarang,
    harga: selectedItem.harga,
    stok: selectedItem.stok,
    gender: selectedItem.gender,
    kategori: selectedItem.kategori,
  };

}

const saveEdit = async () => {
  try {
    const itemRef = doc(db, 'dataBarang', editedData.value.id);

    // Update the document with the edited values
    await updateDoc(itemRef, {
      namaBarang: editedData.value.namaBarang,
      harga: editedData.value.harga,
      stok: editedData.value.stok,
      gender: editedData.value.gender,
      kategori: editedData.value.kategori,
    });

    // Hide the edit modal
    closeModal();
    alert('Item updated successfully!');
  } catch (error) {
    console.error('Error updating item:', error);
  }
};

const closeModal = () => {
  // Clear the editedData values
  editedData.value = {
    id: null,
    namaBarang: '',
    harga: '',
    stok: '',
    gender: '',
    kategori: '',
  };

  // Hide the edit modal
  showEditModal.value = false;
};
</script>

<style scoped>

.shop {
  width: 80vw;

}

.shop h1 {
  margin: 10px 20px;
  text-align: center;
}

.table-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 30px 10px;

  background-color: white;
  max-height: 40vh;
  overflow: hidden;
  overflow-y: scroll;
}

#form-addItem {
  width: 100%;
  margin: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.input-con {
  width: 350px;
  display: flex;
  justify-content: space-between;
}

.input-con input,
.input-con select {
  width: 200px;
  background-color: white;
  padding: 5px 0;
  border-radius: 5px;
}

.input-con input {
  border: 1px solid gray;
  outline: none;
  border-radius: 5px;
}

#form-addItem button {
  width: 350px;
  height: 35px;

}

table,
tr,
td,
th {
  border: 1px solid rgb(192, 191, 191);
  border-collapse: collapse;
}

td,
th {
  padding: 5px 3px;
  text-align: center;
}

table {
  width: 100%;
}

.btnGrp {
  display: flex;
  justify-content: space-around;
}

.btnGrp button {
  padding: 5px 10px;
  border-radius: 10px;
  width: 70px;
  border: none;
  cursor: pointer;
}

#img-con {
  position: relative;
}

#img-con button {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  top: -10px;
  right: -10px;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  /* Ensure the modal is above other elements */
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 60%;
  /* Adjust the width as needed */
  max-width: 400px;
  /* Set a maximum width if desired */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content label {
  display: block;
  margin-bottom: 8px;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.modal-content button {
  width: 100%;
  padding: 10px;
  border: none;

  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;
}

.modal-content button.cancel {
  background-color: #95a5a6;
  margin-right: 10px;
}
</style>
