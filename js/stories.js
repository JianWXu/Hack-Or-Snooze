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

  $allStoriesList.show();
}

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
  console.log("clicked");
}

$submitForm.on("submit", submitFormStory);

async function toggleFavorites(event) {
  const target = $(event.target);
  const closestI = target.closest("i");
  let storyId = closestI.closest("li").attr("id");
  const story = storyList.stories.find((el) => el.storyId === storyId);
  console.log(story);

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

$allStoriesList.on("click", "#star", toggleFavorites);

$userFavoriteList.on("click", "#star", toggleFavorites);
