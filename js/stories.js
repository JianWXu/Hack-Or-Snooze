"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

function favoritedStoryChecker(user, story) {
  let starType = "";
  let checker = user.addOrRemoveFavorites(story);
  if (checker) {
    starType = "fa-solid";
  } else {
    starType = "fa-regular";
  }
  return starType;
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  let starType = favoritedStoryChecker(currentUser, story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="${starType} fa-star" id="star"></i><a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $userOwnStoriesList.hide();
  $userFavoriteList.hide();
  $allStoriesList.show();
}

//submits story info on form and appends it to the page
async function submitFormStory() {
  let author = $("#author-input").val();
  let title = $("#title-input").val();
  let url = $("#url-input").val();
  let submittedStory = await storyList.addStory(currentUser, {
    author,
    title,
    url,
  });

  const $myStory = generateStoryMarkup(submittedStory);
  $storiesContainer.append($myStory);
  // $storiesContainer.show();
  $("#author-input").val("");
  $("#title-input").val("");
  $("#url-input").val("");
}

/*changes star from regular to solid and also add or deletes favorite from API
according to what type of star it is
*/
async function toggleFavorites(event) {
  const target = $(event.target);
  const closestI = target.closest("i");
  let storyId = closestI.closest("li").attr("id");
  const story = storyList.stories.find((el) => el.storyId === storyId);

  if (closestI.hasClass("fa-regular")) {
    closestI.removeClass("fa-regular");
    closestI.addClass("fa-solid");
    await currentUser.addToFavoritesArray(story);
  } else {
    closestI.removeClass("fa-solid");
    closestI.addClass("fa-regular");
    await currentUser.deleteFavoritesArray(story);
  }
}

//method for "creating" a new page for user favorites page, append fav stories to it
function favoriteClick() {
  let favorites = currentUser.favorites;
  $userFavoriteList.empty();
  $userOwnStoriesList.hide();
  $allStoriesList.hide();
  if (favorites.length === 0) {
    $userFavoriteList.append("<p>No favorites Added!</p>");
  } else {
    for (let favorite of favorites) {
      const $favorites = generateStoryMarkup(favorite);
      $userFavoriteList.append($favorites);
    }
  }
  $userFavoriteList.show();
}

/*method for "creating" a new page for user created stories, append created stories to it
also adds trashcan emoji to every li created */
function findOwnStories() {
  $allStoriesList.hide();
  $userFavoriteList.hide();
  let ownStories = currentUser.ownStories;
  if (ownStories.length === 0) {
    $userOwnStoriesList.append("<p>No Stories Added</p>");
  } else {
    for (let ownStory of ownStories) {
      const $ownStories = generateStoryMarkup(ownStory);
      $userOwnStoriesList.append($ownStories);
    }
    $("li").each(function () {
      $(this).prepend("<i class='fa-solid fa-trash-can' id='trashCan'></i>");
    });
  }
  $userOwnStoriesList.show();
}

//deleting user created story from API and website when user clicks on the trashcan
async function deleteOwnStory(event) {
  const target = $(event.target);
  const closestLi = target.closest("li");
  let storyId = closestLi.attr("id");
  const story = storyList.stories.find((el) => el.storyId === storyId);
  await storyList.deleteStory(currentUser, story);
  closestLi.remove();
}

$submitForm.on("submit", submitFormStory);

$allStoriesList.on("click", "#star", toggleFavorites);

$userFavoriteList.on("click", "#star", toggleFavorites);

$userFavoriteList.on("click", "#star", favoriteClick);

$userOwnStoriesList.on("click", "#trashCan", deleteOwnStory);

$navUserFavorites.on("click", favoriteClick);

$navMyStories.on("click", findOwnStories);
