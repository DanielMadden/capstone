<template>
  <div class="myModal-content">
    <!-- <form id="formatForm" @submit.prevent="updateGroup"> -->
    <div class="myModal-frame dark-scrollbar">
      <div class="row d-flex">
        <div class="col-12 text-center">
          <h1>Edit Group</h1>
        </div>
        <div class="col-6 my-1">
          <div class="form-group">
            <input type="text"
                   v-model="form.name"
                   class="form-control"
                   name="new-group-name-input"
                   id="new-group-name-input"
                   aria-describedby="helpId"
                   placeholder="Group name"
                   required="true"
            >
          </div>
        </div>
        <div class="col-6 my-1">
          <div class="form-group">
            <input type="text"
                   v-model="form.description"
                   class="form-control"
                   name="new-group-description-input"
                   id="new-group-description-input"
                   aria-describedby="helpId"
                   placeholder="Group description"
                   required="true"
            >
          </div>
        </div>
        <div class="col-6 my-1">
          <div class="form-group">
            <input type="text"
                   class="form-control"
                   name="new-group-image-input"
                   id="new-group-image-input"
                   aria-describedby="helpId"
                   placeholder="Image search"
                   @blur="getImages($event)"
            >
            <small v-if="potentialImages[0]" class="form-text text-muted">Select an available image below</small>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row" v-for="i in Math.ceil(potentialImages.length / 2)" :key="i">
          <div class="col justify-content-center py-1" v-for="img in potentialImages.slice((i - 1) * 2, i * 2)" :key="img.name">
            <img
              class="imageResizeEdit rounded-lg img-fluid"
              :src="img.imageURL"
              :alt="img.name"
              @click="highlightImage($event)"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="myModal-footer justify-content-between">
      <button id="myModal-button-delete-group"
              class="myModal-button delete"
              @click="deleteGroup()"
      >
        <i class="fas fa-trash"></i>
      </button>
      <button id="myModal-button-update-group"
              class="myModal-button"
              @click="updateGroup()"
      >
        Update
      </button>
    </div>
    <!-- </form> -->
  </div>
</template>
<script>
import { computed, reactive } from 'vue'
import { AppState } from '../AppState'
import { groupService } from '../services/GroupService'
import { closeModals } from '../utils/Modal'
import { logger } from '../utils/Logger'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const router = useRouter()
    const potentialImages = computed(() => AppState.groupImages)
    const form = reactive({
      name: AppState.activeGroup.name,
      description: AppState.activeGroup.description,
      imageUrl: AppState.activeGroup.imageUrl
    })
    const group = computed(() => AppState.activeGroup)
    const updateGroup = async() => {
      try {
        form.imageUrl = document.getElementsByClassName('highlightImageEdit')[0].currentSrc
        logger.log(form)
        await groupService.editGroup(form, AppState.activeGroup.id)
        AppState.groupImages = []
        closeModals()
      } catch (error) {
        logger.error(error)
      }
    }
    let deleting = false
    const deleteGroup = async() => {
      if (deleting === false) {
        deleting = true
        await groupService.deleteGroup(AppState.activeGroup.id)
        closeModals()
        router.push('/')
      }
    }
    return {
      group,
      form,
      updateGroup,
      deleteGroup,
      potentialImages,

      async getImages(e) {
        await groupService.getImagesForGroup(e.target.value)
        const elements = document.getElementsByClassName('imageResizeEdit')
        if (elements.length > 0) {
          elements[0].classList.add('highlightImageEdit')
        }
      },
      highlightImage(e) {
        const imgs = e.target.parentNode.parentNode.parentNode.querySelectorAll('img')
        imgs.forEach(i => i.classList.remove('highlightImageEdit'))
        e.target.classList.add('highlightImageEdit')
      }
    }
  }
}
</script>
<style scoped>
@import "../assets/css/modals.css";
.highlightImageEdit {
  box-shadow: 0 0 5px rgba(81, 203, 238, 1);
  border: 3px solid rgba(81, 203, 238, 1);
}

.imageResizeEdit{
  width: 100%;
  height: 200px;
  margin: auto;
  display: block;
}
</style>
