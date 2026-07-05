<template>
    <div style="margin-top: 24px">
        <Giscus
            id="comments"
            repo="shxiaj/shxiaj.github.io"
            repoid="MDEwOlJlcG9zaXRvcnkzNTg0ODAxNDE="
            category="General"
            categoryid="DIC_kwDOFV35Dc4DAfyx"
            mapping="pathname"
            term="Welcome to giscus!"
            reactionsenabled="1"
            emitmetadata="0"
            inputposition="top"
            loading="lazy"
            :theme="isDark ? 'dark' : 'light'"
            :key="route.path"
        ></Giscus>
    </div>
</template>

<script setup>
import Giscus from '@giscus/vue';
import { useRoute, useData } from 'vitepress';

const route = useRoute();
const { isDark } = useData();
</script>
