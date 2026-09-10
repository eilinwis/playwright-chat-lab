import { useState } from 'react'

const DEFAULT_VOLUME = 50

export default function VolumeSlider() {
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const isAtDefault = volume === DEFAULT_VOLUME

  return (
    <div className="widget-volume">
      <label className="widget-volume__label" htmlFor="volume-slider">
        Volume
      </label>

      <div className="widget-volume__controls">
        <input
          id="volume-slider"
          className="widget-volume__slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          data-testid="volume-slider"
          onChange={(e) => setVolume(Number(e.target.value))}
        />

        <button
          type="button"
          className="widget-volume__reset"
          data-testid="volume-reset"
          onClick={() => setVolume(DEFAULT_VOLUME)}
          disabled={isAtDefault}
        >
          Reset
        </button>
      </div>

      <span className="widget-volume__value" data-testid="volume-value">
        {volume}%
      </span>
    </div>
  )
}
