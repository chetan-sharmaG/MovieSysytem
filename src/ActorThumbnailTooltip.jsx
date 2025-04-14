import React, { useEffect, useState, useRef } from "react";
import { Tooltip, Box } from "@mui/material";

const imageCache = {}; // In-memory image cache

const ActorThumbnailTooltip = ({ actor }) => {
  const [actorImg, setActorImg] = useState(null);
  const [open, setOpen] = useState(false);
  const hoverRef = useRef(null);

  useEffect(() => {
    const fetchActorImage = async () => {
      if (imageCache[actor.name]) {
        setActorImg(imageCache[actor.name]);
        return;
      }

      try {
        const response = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actor.name)}`
        );
        const data = await response.json();
        const imgSrc =
          data.description?.toLowerCase().includes("actor") ||
          data.description?.toLowerCase().includes("actress")
            ? data.thumbnail?.source
            : "https://placehold.co/300x300/yellow/black?text=No%20Image";

        imageCache[actor.name] = imgSrc;
        setActorImg(imgSrc);
      } catch {
        const fallback =
          "https://placehold.co/300x300/yellow/black?text=No%20Image";
        imageCache[actor.name] = fallback;
        setActorImg(fallback);
      }
    };

    fetchActorImage();
  }, [actor.name]);

  return (
    <Tooltip
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      placement="top"
      title={
        <Box
          sx={{
            backgroundColor: "#111",
            padding: 1,
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0,0,0,0.6)",
          }}
        >
          <img
            src={actorImg}
            alt={actor.name}
            width={120}
            style={{ borderRadius: "6px", objectFit: "cover" }}
          />
        </Box>
      }
    >
      <a
        ref={hoverRef}
        href={actor.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          marginRight: 4,
          color: "#fff",
          fontWeight: 500,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        {actor.name}
      </a>
    </Tooltip>
  );
};

export default ActorThumbnailTooltip;
