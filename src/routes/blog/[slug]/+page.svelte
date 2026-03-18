<script lang="ts">
  let { data } = $props();
  const Post = data.component;
</script>

<h1>{data.metadata.title ?? "Untitled post"}</h1>

<Post />
